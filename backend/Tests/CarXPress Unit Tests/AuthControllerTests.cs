using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

using RESTful_API.Controllers;
using RESTful_API.Models;

// BCrypt pelo namespace completo para evitar conflitos
using BcryptNet = BCrypt.Net.BCrypt;

namespace Unit_Tests
{
    public class AuthControllerTests
    {
        private const string ValidSecret = "uma_chave_muitolonga_para_tests_de_jwt_1234567890";

        private PdsContext CreateInMemoryContext(string dbName)
        {
            var opts = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            var ctx = new PdsContext(opts);

            // seed dos tipos de login
            ctx.TipoLogins.AddRange(
                new TipoLogin { Idtlogin = 1, Tlogin = "cliente" },
                new TipoLogin { Idtlogin = 2, Tlogin = "empresa" },
                new TipoLogin { Idtlogin = 3, Tlogin = "admin" }
            );
            ctx.SaveChanges();
            return ctx;
        }

        private IConfiguration CreateConfiguration(string secret)
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["JwtSettings:Secret"] = secret
                })
                .Build();
        }

        // helper para extrair propriedade de um object anónimo
        private static string GetAnonymousProperty(object anon, string propName)
        {
            var prop = anon.GetType().GetProperty(propName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (prop == null)
                throw new InvalidOperationException($"Propriedade '{propName}' não encontrada em {anon.GetType().Name}");
            return prop.GetValue(anon)?.ToString()!;
        }

        // --- LOGIN ---

        [Fact]
        public async Task Login_NullRequest_ReturnsBadRequest()
        {
            var ctx = CreateInMemoryContext("Login_Null");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var res = await ctl.Login(null);

            var bad = Assert.IsType<BadRequestObjectResult>(res);
            Assert.Equal("Email e password são obrigatórios.", bad.Value);
        }

        [Fact]
        public async Task Login_UserNotFound_ReturnsUnauthorized()
        {
            var ctx = CreateInMemoryContext("Login_NotFound");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.LoginRequest
            {
                Username = "x@x.com",
                Password = "qq"
            };

            var res = await ctl.Login(req);

            var una = Assert.IsType<UnauthorizedObjectResult>(res);
            Assert.Equal("Email ou password inválidos.", una.Value);
        }

        [Fact]
        public async Task Login_InvalidPassword_ReturnsUnauthorized()
        {
            var ctx = CreateInMemoryContext("Login_WrongPwd");
            var user = new Login
            {
                Email = "u@u.com",
                HashPassword = BcryptNet.HashPassword("certa"),
                TipoLoginIdtlogin = 1
            };
            ctx.Logins.Add(user);
            ctx.SaveChanges();

            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);
            var req = new AuthController.LoginRequest
            {
                Username = user.Email,
                Password = "errada"
            };

            var res = await ctl.Login(req);

            var una = Assert.IsType<UnauthorizedObjectResult>(res);
            Assert.Equal("Email ou password inválidos.", una.Value);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            var ctx = CreateInMemoryContext("Login_Valid");
            var user = new Login
            {
                Email = "c@c.com",
                HashPassword = BcryptNet.HashPassword("1234"),
                TipoLoginIdtlogin = 1
            };
            ctx.Logins.Add(user);
            ctx.SaveChanges();

            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);
            var req = new AuthController.LoginRequest
            {
                Username = user.Email,
                Password = "1234"
            };

            var res = await ctl.Login(req);

            var ok = Assert.IsType<OkObjectResult>(res);

            // extrai "token" via reflection
            var token = GetAnonymousProperty(ok.Value!, "token");
            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        // --- REGISTER ---

        [Fact]
        public async Task Register_NullRequest_ReturnsBadRequest()
        {
            var ctx = CreateInMemoryContext("Reg_Null");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var res = await ctl.Register(null);

            var bad = Assert.IsType<BadRequestObjectResult>(res);
            Assert.Equal("Email e password são obrigatórios.", bad.Value);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(99)]
        public async Task Register_InvalidTipo_ReturnsBadRequest(int tipo)
        {
            var ctx = CreateInMemoryContext($"Reg_BadTipo_{tipo}");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.RegisterRequest
            {
                Username = "novo@ex.com",
                Password = "senha",
                TipoLoginIDTLogin = tipo
            };

            var res = await ctl.Register(req);

            var bad = Assert.IsType<BadRequestObjectResult>(res);
            Assert.Equal("Tipo de utilizador inválido.", bad.Value);
        }

        [Fact]
        public async Task Register_InvalidEmailFormat_ReturnsBadRequest()
        {
            var ctx = CreateInMemoryContext("Reg_BadEmail");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.RegisterRequest
            {
                Username = "semarroba",
                Password = "senha",
                TipoLoginIDTLogin = 1
            };

            var res = await ctl.Register(req);

            var bad = Assert.IsType<BadRequestObjectResult>(res);
            Assert.Equal("Formato de email inválido.", bad.Value);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            var ctx = CreateInMemoryContext("Reg_Dup");
            var existing = new Login
            {
                Email = "dup@ex.com",
                HashPassword = BcryptNet.HashPassword("x"),
                TipoLoginIdtlogin = 1
            };
            ctx.Logins.Add(existing);
            ctx.SaveChanges();

            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.RegisterRequest
            {
                Username = existing.Email,
                Password = "outra",
                TipoLoginIDTLogin = 1
            };

            var res = await ctl.Register(req);

            var bad = Assert.IsType<BadRequestObjectResult>(res);

            // extrai message via reflection
            var msg = GetAnonymousProperty(bad.Value!, "message");
            Assert.Equal("Este email já se encontra registado.", msg);
        }

        [Fact]
        public async Task Register_Success_ReturnsOk()
        {
            var ctx = CreateInMemoryContext("Reg_Succ");
            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.RegisterRequest
            {
                Username = "novo2@ex.com",
                Password = "senhaSegura",
                TipoLoginIDTLogin = 2
            };

            var res = await ctl.Register(req);

            var ok = Assert.IsType<OkObjectResult>(res);

            // extrai message via reflection
            var msg = GetAnonymousProperty(ok.Value!, "message");
            Assert.Equal("Utilizador registado com sucesso.", msg);

            // confirma na BD
            Assert.True(ctx.Logins.Any(u => u.Email == req.Username));
        }

        // --- test de SaveChangesAsync a falhar ---

        private class FailSaveContext : PdsContext
        {
            public FailSaveContext(DbContextOptions<PdsContext> options)
                : base(options) { }

            public override Task<int> SaveChangesAsync(
                CancellationToken cancellationToken = default)
            {
                throw new DbUpdateException("fail", new Exception("inner"));
            }
        }

        [Fact]
        public async Task Register_DbUpdateException_ReturnsServerError()
        {
            var opts = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase("Reg_DbFail")
                .Options;
            // usa o contexto que lança na SaveChangesAsync
            var ctx = new FailSaveContext(opts);

            // seed dos tipos
            ctx.TipoLogins.AddRange(
                new TipoLogin { Idtlogin = 1, Tlogin = "cliente" },
                new TipoLogin { Idtlogin = 2, Tlogin = "empresa" }
            );
            ctx.SaveChanges();

            var cfg = CreateConfiguration(ValidSecret);
            var ctl = new AuthController(ctx, cfg);

            var req = new AuthController.RegisterRequest
            {
                Username = "erro@ex.com",
                Password = "x",
                TipoLoginIDTLogin = 1
            };

            var res = await ctl.Register(req);

            var obj = Assert.IsType<ObjectResult>(res);
            Assert.Equal(500, obj.StatusCode);

            // valor é string (não anónimo)
            Assert.Equal(
                "Erro ao guardar o novo utilizador. Tente novamente.",
                obj.Value);
        }
    }
}
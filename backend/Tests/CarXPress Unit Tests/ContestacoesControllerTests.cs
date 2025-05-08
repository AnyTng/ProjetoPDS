using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using RESTful_API.Controllers;
using RESTful_API.Interface;
using RESTful_API.Models;
using Xunit;

namespace Unit_Tests
{
    public class ContestacoesControllerTests : IDisposable
    {
        private readonly PdsContext _context;
        private readonly ContestacoesController _controller;
        private readonly Mock<IEmailService> _mockEmailService;

        public ContestacoesControllerTests()
        {
            // 1) In-memory EF Core context
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new PdsContext(options);

            // 2) Mock email service
            _mockEmailService = new Mock<IEmailService>();

            // 3) Controller under test
            _controller = new ContestacoesController(_context, _mockEmailService.Object);
        }

        private void SetUser(int userId, int roleId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("roleId", roleId.ToString())
            }, "mock"));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task CriarContestacao_ReturnsUnauthorized_WhenTokenInvalid()
        {
            SetUser(0, 0);
            var result = await _controller.CriarContestacao("desc", 1);
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task CriarContestacao_ReturnsForbid_WhenNotCliente()
        {
            SetUser(1, 2);
            var result = await _controller.CriarContestacao("desc", 1);
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsUnauthorized_WhenTokenInvalid()
        {
            SetUser(0, 0);
            var result = await _controller.AlterarContestacao(1, "Aceite");
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsForbid_WhenNotAdmin()
        {
            SetUser(1, 1);
            var result = await _controller.AlterarContestacao(1, "Aceite");
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsBadRequest_WhenEstadoInvalid()
        {
            // Arrange: valid admin login
            _context.Logins.Add(new Login {
                Idlogin           = 1,
                Email             = "admin@teste.com",
                HashPassword      = "hashdummy",
                TipoLoginIdtlogin = 3
            });

            // Arrange: existing contestação
            _context.Contestacaos.Add(new Contestacao {
                Idcontestacao       = 1,
                ClienteIdcliente    = 42,
                InfracoesIdinfracao = 99,
                EstadoContestacao   = "Pendente"
            });

            await _context.SaveChangesAsync();

            // Act as admin
            SetUser(1, 3);
            var result = await _controller.AlterarContestacao(1, "Outro");

            // Assert
            var badReq = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(
                "Estado da contestação inválido. Deve ser 'Aceite' ou 'Negada'.",
                badReq.Value
            );
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
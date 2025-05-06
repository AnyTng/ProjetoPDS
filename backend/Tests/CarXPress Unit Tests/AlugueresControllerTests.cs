using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using RESTful_API.Controllers;
using RESTful_API.Models;
using Xunit;

namespace Unit_Tests
{
    public class AlugueresControllerTests : IDisposable
    {
        private readonly DbContextOptions<PdsContext> _options;
        private readonly Mock<IConfiguration> _mockConfig;

        public AlugueresControllerTests()
        {
            // each test class instance gets its own random DB name
            _options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(c => c["Stripe:SecretKey"])
                .Returns("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
            _mockConfig.Setup(c => c["Frontend:BaseUrl"])
                .Returns("https://example.com");
        }

        /// <summary>
        /// Shared seeding for the simple GET/PUT tests.
        /// </summary>
        private PdsContext GetInMemoryContext()
        {
            var ctx = new PdsContext(_options);
            ctx.Database.EnsureCreated();

            // seed two Aluguers so that GetAluguer and GetAlugueres pass
            if (!ctx.Aluguers.Any(a => a.Idaluguer == 1))
            {
                ctx.Aluguers.AddRange(
                    new Aluguer
                    {
                        Idaluguer = 1,
                        ClienteIdcliente = 1,
                        VeiculoIdveiculo = 1,
                        DataLevantamento = DateTime.Now,
                        DataEntregaPrevista = DateTime.Now.AddDays(5)
                    },
                    new Aluguer
                    {
                        Idaluguer = 2,
                        ClienteIdcliente = 2,
                        VeiculoIdveiculo = 2,
                        DataLevantamento = DateTime.Now,
                        DataEntregaPrevista = DateTime.Now.AddDays(3)
                    }
                );
                ctx.SaveChanges();
            }

            return ctx;
        }

        private void SetUser(ControllerBase ctrl, int userId, int roleId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("roleId", roleId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "test");
            var principal = new ClaimsPrincipal(identity);

            ctrl.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }

        [Fact]
        public async Task GetAluguer_ReturnsAluguer()
        {
            await using var ctx = GetInMemoryContext();
            var ctrl = new AlugueresController(ctx, _mockConfig.Object);

            var result = await ctrl.GetAluguer(1);

            var ar = Assert.IsType<ActionResult<Aluguer>>(result);
            var ok = Assert.IsType<OkObjectResult>(ar.Result);
            var item = Assert.IsType<Aluguer>(ok.Value);
            Assert.Equal(1, item.Idaluguer);
        }

        [Fact]
        public async Task GetAlugueres_ReturnsAllAlugueres()
        {
            await using var ctx = GetInMemoryContext();
            var ctrl = new AlugueresController(ctx, _mockConfig.Object);

            var result = await ctrl.GetAluguers();

            var ar = Assert.IsType<ActionResult<IEnumerable<Aluguer>>>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<Aluguer>>(ar.Value);
            Assert.Equal(2, list.Count());
        }

        [Fact]
        public async Task PostAluguer_CreatesNewAluguer()
        {
            await using var ctx = GetInMemoryContext();
            var ctrl = new AlugueresController(ctx, _mockConfig.Object);

            var novo = new Aluguer
            {
                ClienteIdcliente = 3,
                VeiculoIdveiculo = 3,
                DataLevantamento = DateTime.Now,
                DataEntregaPrevista = DateTime.Now.AddDays(7)
            };

            var result = await ctrl.PostAluguer(novo);

            var ar = Assert.IsType<ActionResult<Aluguer>>(result);
            var created = Assert.IsType<CreatedAtActionResult>(ar.Result);
            var item = Assert.IsType<Aluguer>(created.Value);

            Assert.Equal(3, item.ClienteIdcliente);
            Assert.Equal(3, item.VeiculoIdveiculo);
        }

        [Fact]
        public async Task PutAluguer_UpdatesExistingAluguer()
        {
            await using var ctx = GetInMemoryContext();
            var ctrl = new AlugueresController(ctx, _mockConfig.Object);

            var upd = new Aluguer
            {
                Idaluguer = 1,
                ClienteIdcliente = 1,
                VeiculoIdveiculo = 1,
                DataLevantamento = DateTime.Now,
                DataEntregaPrevista = DateTime.Now.AddDays(7),
                EstadoAluguer = "Alugado"
            };

            var result = await ctrl.PutAluguer(1, upd);

            Assert.IsType<NoContentResult>(result);
            var fromDb = await ctx.Aluguers.FindAsync(1);
            Assert.Equal("Alugado", fromDb.EstadoAluguer);
        }


        [Fact]
        public async Task GetHistoricoAluguer_ReturnsClienteAlugueres()
        {
            var histOptions = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            await using var ctx = new PdsContext(histOptions);


            var loginCliente = new Login
            {
                Idlogin = 1,
                HashPassword = "dummy",
                TipoLoginIdtlogin = 1
            };
            ctx.Logins.Add(loginCliente);

            var cliente = new Cliente
            {
                Idcliente = 1,
                LoginIdlogin = loginCliente.Idlogin,
                NomeCliente = "Teste",
                ContactoC1 = 912345678,
                Nifcliente = 123123123
            };
            ctx.Clientes.Add(cliente);

            var marca = new MarcaVeiculo
            {
                Idmarca = 1,
                DescMarca = "Marca Teste"
            };
            ctx.MarcaVeiculos.Add(marca);

            var modelo = new ModeloVeiculo
            {
                Idmodelo = 1,
                DescModelo = "Modelo Teste",
                MarcaVeiculoIdmarca = marca.Idmarca
            };
            ctx.ModeloVeiculos.Add(modelo);

            var veiculo = new Veiculo
            {
                Idveiculo = 7,
                MatriculaVeiculo = "XX-00-YY",
                EstadoVeiculo = "Disponível",
                LotacaoVeiculo = 4,
                ModeloVeiculoIdmodelo = modelo.Idmodelo
            };
            ctx.Veiculos.Add(veiculo);

            var aluguer = new Aluguer
            {
                Idaluguer = 99,
                ClienteIdcliente = cliente.Idcliente,
                VeiculoIdveiculo = veiculo.Idveiculo,
                DataLevantamento = DateTime.Now,
                DataEntregaPrevista = DateTime.Now.AddDays(2),
                EstadoAluguer = "Concluido"
            };
            ctx.Aluguers.Add(aluguer);

            await ctx.SaveChangesAsync();

            var ctrl = new AlugueresController(ctx, _mockConfig.Object);
            SetUser(ctrl, loginCliente.Idlogin,
                loginCliente.TipoLoginIdtlogin); // Use o Idlogin e TipoLoginIdtlogin do login semeado

            // Act
            var result = await ctrl.historicoAluguer();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<object>>(ok.Value);

            Assert.NotEmpty(list);

            var historicoItem = Assert.Single(list);
        }

        [Fact]
        public async Task GetHistoricoAluguer_AsAdmin_ShouldFail()
        {
            await using var ctx = GetInMemoryContext();
            // just need a login entry for the admin check
            ctx.Logins.Add(new Login
            {
                Idlogin = 3,
                HashPassword = "dummy",
                TipoLoginIdtlogin = 3
            });
            await ctx.SaveChangesAsync();

            var ctrl = new AlugueresController(ctx, _mockConfig.Object);
            SetUser(ctrl, 3, 3);

            var result = await ctrl.historicoAluguer();
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task PutAvaliaAluguer_UpdatesClassificacao()
        {
            await using var ctx = GetInMemoryContext();
            ctx.Logins.Add(new Login
            {
                Idlogin = 1,
                HashPassword = "dummy",
                TipoLoginIdtlogin = 1
            });
            ctx.Aluguers.Add(new Aluguer
            {
                Idaluguer = 3,
                ClienteIdcliente = 1,
                EstadoAluguer = "Concluido"
            });
            await ctx.SaveChangesAsync();

            var ctrl = new AlugueresController(ctx, _mockConfig.Object);
            SetUser(ctrl, 1, 1);

            var result = await ctrl.PutAvaliaAluguer(3, 5);
            Assert.IsType<NoContentResult>(result);

            var updated = await ctx.Aluguers.FindAsync(3);
            Assert.Equal(5, updated.Classificacao);
        }

        [Fact]
        public async Task PutCancelarAluguer_CancelsAluguer()
        {
            await using var ctx = GetInMemoryContext();
            ctx.Logins.Add(new Login
            {
                Idlogin = 1,
                HashPassword = "dummy",
                TipoLoginIdtlogin = 1
            });
            var carro = new Veiculo
            {
                Idveiculo = 7,
                EstadoVeiculo = "Alugado"
            };
            ctx.Veiculos.Add(carro);
            ctx.Aluguers.Add(new Aluguer
            {
                Idaluguer = 3,
                ClienteIdcliente = 1,
                VeiculoIdveiculo = 7,
                EstadoAluguer = "Pendente",
                VeiculoIdveiculoNavigation = carro
            });
            await ctx.SaveChangesAsync();

            var ctrl = new AlugueresController(ctx, _mockConfig.Object);
            SetUser(ctrl, 1, 1);

            var result = await ctrl.PutCancelarAluguer(3);
            Assert.IsType<OkResult>(result);

            var fromDb = await ctx.Aluguers
                .Include(a => a.VeiculoIdveiculoNavigation)
                .FirstAsync(a => a.Idaluguer == 3);
            Assert.Equal("Cancelado", fromDb.EstadoAluguer);
            Assert.Equal("Disponível", fromDb.VeiculoIdveiculoNavigation.EstadoVeiculo);
        }

        public void Dispose()
        {
            // tear down the in-memory database
            using var ctx = new PdsContext(_options);
            ctx.Database.EnsureDeleted();
        }
    }
}
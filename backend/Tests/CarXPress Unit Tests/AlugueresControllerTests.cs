using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using RESTful_API.Controllers;
using RESTful_API.Models;

namespace Unit_Tests
{
    public class AlugueresControllerTests
    {
        private readonly DbContextOptions<PdsContext> _options;
        private readonly Mock<IConfiguration> _mockConfig;

        public AlugueresControllerTests()
        {
            _options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(config => config["Stripe:SecretKey"]).Returns("sk_test_4eC39HqLyjWDarjtT1zdp7dc");
        }

        private PdsContext GetInMemoryContext()
        {
            var context = new PdsContext(_options);
            context.Database.EnsureCreated();

            if (!context.Aluguers.Any())
            {
                context.Aluguers.AddRange(
                    new Aluguer { Idaluguer = 1, ClienteIdcliente = 1, VeiculoIdveiculo = 1, DataLevantamento = DateTime.Now, DataEntregaPrevista = DateTime.Now.AddDays(5) },
                    new Aluguer { Idaluguer = 2, ClienteIdcliente = 2, VeiculoIdveiculo = 2, DataLevantamento = DateTime.Now, DataEntregaPrevista = DateTime.Now.AddDays(3) }
                );
                context.SaveChanges();
            }

            return context;
        }

        [Fact]
        public async Task GetAluguer_ReturnsAluguer()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);
            var testId = 1;

            // Act
            var result = await controller.GetAluguer(testId);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Aluguer>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var aluguer = Assert.IsType<Aluguer>(okResult.Value);
            Assert.Equal(testId, aluguer.Idaluguer);
        }

        [Fact]
        public async Task PostAluguer_CreatesNewAluguer()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);
            var newAluguer = new Aluguer
            {
                ClienteIdcliente = 3,
                VeiculoIdveiculo = 3,
                DataLevantamento = DateTime.Now,
                DataEntregaPrevista = DateTime.Now.AddDays(7)
            };

            // Act
            var result = await controller.PostAluguer(newAluguer);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Aluguer>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var createdAluguer = Assert.IsType<Aluguer>(createdAtActionResult.Value);
            Assert.Equal(newAluguer.ClienteIdcliente, createdAluguer.ClienteIdcliente);
            Assert.Equal(newAluguer.VeiculoIdveiculo, createdAluguer.VeiculoIdveiculo);
        }

        [Fact]
        public async Task PutAluguer_UpdatesExistingAluguer()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);
            var updateAluguer = new Aluguer
            {
                Idaluguer = 1,
                ClienteIdcliente = 1,
                VeiculoIdveiculo = 1,
                DataLevantamento = DateTime.Now,
                DataEntregaPrevista = DateTime.Now.AddDays(7),
                EstadoAluguer = "Alugado"
            };

            // Act
            var result = await controller.PutAluguer(1, updateAluguer);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var aluguer = await context.Aluguers.FindAsync(1);
            Assert.Equal("Alugado", aluguer.EstadoAluguer);
        }

        [Fact]
        public async Task GetAlugueres_ReturnsAllAlugueres()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);

            // Act
            var result = await controller.GetAluguers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Aluguer>>>(result);
            var alugueres = Assert.IsAssignableFrom<IEnumerable<Aluguer>>(actionResult.Value);
            Assert.Equal(2, alugueres.Count());
        }

        [Fact]
        public async Task PutAvaliaAluguer_UpdatesClassificacao()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);

            // Setup user claims
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim("roleId", "1")
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Add a completed aluguer to test
            var testAluguer = new Aluguer
            {
                Idaluguer = 3,
                ClienteIdcliente = 1,
                EstadoAluguer = "Concluido"
            };
            context.Aluguers.Add(testAluguer);
            await context.SaveChangesAsync();

            // Act
            var result = await controller.PutAvaliaAluguer(3, 5);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var updatedAluguer = await context.Aluguers.FindAsync(3);
            Assert.Equal(5, updatedAluguer.Classificacao);
        }

        [Fact]
        public async Task PutCancelarAluguer_CancelsAluguer()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);

            // Setup user claims
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim("roleId", "1")
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Add a pending aluguer
            var veiculo = new Veiculo { Idveiculo = 3, EstadoVeiculo = "Alugado" };
            context.Veiculos.Add(veiculo);
            var testAluguer = new Aluguer
            {
                Idaluguer = 3,
                VeiculoIdveiculo = 3,
                EstadoAluguer = "Pendente",
                VeiculoIdveiculoNavigation = veiculo
            };
            context.Aluguers.Add(testAluguer);
            await context.SaveChangesAsync();

            // Act
            var result = await controller.PutCancelarAluguer(3);

            // Assert
            Assert.IsType<OkResult>(result);
            var updatedAluguer = await context.Aluguers.FindAsync(3);
            Assert.Equal("Cancelado", updatedAluguer.EstadoAluguer);
            Assert.Equal("Disponível", updatedAluguer.VeiculoIdveiculoNavigation.EstadoVeiculo);
        }

        [Fact]
        public async Task GetHistoricoAluguer_ReturnsClienteAlugueres()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);

            // Setup user claims
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim("roleId", "1")
            };
            var identity = new ClaimsIdentity(claims);
            var claimsPrincipal = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Add a cliente
            var cliente = new Cliente { Idcliente = 1, LoginIdlogin = 1 };
            context.Clientes.Add(cliente);
            await context.SaveChangesAsync();

            // Act
            var result = await controller.historicoAluguer();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var historico = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.NotNull(historico);
        }
    }
}

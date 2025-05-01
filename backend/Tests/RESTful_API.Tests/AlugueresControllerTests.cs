using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using RESTful_API.Controllers;
using RESTful_API.Models;

namespace RESTful_API.Tests
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
        public async Task GetAluguers_ReturnsAllAluguers()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);

            // Act
            var result = await controller.GetAluguers();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Aluguer>>>(result);
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var aluguers = Assert.IsAssignableFrom<IEnumerable<Aluguer>>(okResult.Value);
            Assert.Equal(2, aluguers.Count());
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
        public async Task DeleteAluguer_DeletesAluguer()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new AlugueresController(context, _mockConfig.Object);
            var testId = 1;

            // Act
            var result = await controller.DeleteAluguer(testId);

            // Assert
            var actionResult = Assert.IsType<NoContentResult>(result);
            var aluguer = await context.Aluguers.FindAsync(testId);
            Assert.Null(aluguer);
        }
    }
}

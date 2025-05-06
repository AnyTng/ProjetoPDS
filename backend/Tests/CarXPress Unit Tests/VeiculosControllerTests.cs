using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Controllers;
using RESTful_API.Models;
using Xunit;

namespace Unit_Tests
{
    public class VeiculosControllerTests
    {
        private PdsContext GetDbContextWithData()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                // Each test gets a fresh in-memory database
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new PdsContext(options);

            // Seed Marca, Modelo, Veiculo (+ one Aluguer with Classificacao = 4)
            var marca = new MarcaVeiculo { Idmarca = 1, DescMarca = "MarcaTest" };
            var modelo = new ModeloVeiculo
            {
                Idmodelo = 1,
                DescModelo = "ModeloTest",
                MarcaVeiculoIdmarca = 1,
                MarcaVeiculoIdmarcaNavigation = marca
            };
            var veiculo = new Veiculo
            {
                Idveiculo = 1,
                MatriculaVeiculo = "AA-00-AA",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1,
                ModeloVeiculoIdmodeloNavigation = modelo,
                Aluguers = new List<Aluguer>
                {
                    new Aluguer { Classificacao = 4 }
                }
            };

            context.MarcaVeiculos.Add(marca);
            context.ModeloVeiculos.Add(modelo);
            context.Veiculos.Add(veiculo);
            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task GetVeiculosCliente_ReturnsAvailableVehiclesWithRatings()
        {
            // Arrange
            var context = GetDbContextWithData();
            var controller = new VeiculosController(context);

            // Act
            var result = await controller.GetVeiculosCliente();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var list = Assert.IsAssignableFrom<IEnumerable<ClienteVeiculoDTO>>(okResult.Value);
            Assert.Single(list);

            var dto = list.First();
            Assert.Equal("AA-00-AA", dto.MatriculaVeiculo);
            Assert.Equal(4, dto.Avaliacao);
        }

        [Fact]
        public async Task GetVeiculoClienteID_ReturnsVehicleAndAluguerStatus()
        {
            // Arrange
            var context = GetDbContextWithData();
            // Add a second Aluguer (rating = 5) tied to cliente 123
            context.Aluguers.Add(new Aluguer
            {
                Idaluguer = 2,
                VeiculoIdveiculo = 1,
                ClienteIdcliente = 123,
                EstadoAluguer = "Finalizado",
                Classificacao = 5
            });
            context.SaveChanges();

            var controller = new VeiculosController(context);
            // Mock the authenticated user with ID = 123
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "123")
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var actionResult = await controller.GetVeiculoClienteID(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var response = okResult.Value;
            Assert.NotNull(response);

            // Use reflection to pull out the anonymous-type props
            var respType = response.GetType();

            // Veiculo:
            var veiculoProp = respType.GetProperty("Veiculo");
            Assert.NotNull(veiculoProp);
            var veiculoDto = Assert.IsType<ClienteVeiculoDTO>(veiculoProp.GetValue(response));
            Assert.Equal("AA-00-AA", veiculoDto.MatriculaVeiculo);
            // (4 + 5) / 2 = 4.5
            Assert.Equal(4.5f, veiculoDto.Avaliacao);

            // ExisteAluguer:
            var existeProp = respType.GetProperty("ExisteAluguer");
            Assert.NotNull(existeProp);
            var existeAluguer = (bool)existeProp.GetValue(response);
            Assert.True(existeAluguer);
        }
    }
}
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
using Stripe;
using Xunit;
using RESTful_API.Controllers;
using RESTful_API.Interface;
using RESTful_API.Models;

namespace Unit_Tests
{
    public class InfracoesControllerTest
    {
        private readonly DbContextOptions<PdsContext> _options;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<IConfiguration> _mockConfig;

        public InfracoesControllerTest()
        {
            _options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockEmailService = new Mock<IEmailService>();
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(c => c["Stripe:SecretKey"]).Returns("fake");
            _mockConfig.Setup(c => c["Frontend:BaseUrl"]).Returns("https://example.com");
        }

        private PdsContext GetInMemoryContext()
        {
            var context = new PdsContext(_options);
            context.Database.EnsureCreated();
            return context;
        }


        [Fact]
        public async Task CancelarMulta_Admin_SetsEstadoToCancelada()
        {
            await using var context = GetInMemoryContext();
            var infracao = new Infracao { Idinfracao = 1, EstadoInfracao = "Submetida" };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "2"),
                        new Claim("roleId", "3")
                    }))
                }
            };

            var result = await controller.CancelarMulta(1);

            Assert.IsType<NoContentResult>(result);
            var updated = await context.Infracoes.FindAsync(1);
            Assert.Equal("Cancelada", updated.EstadoInfracao);
        }



        [Fact]
        public async Task PagarMulta_Client_UpdatesEstadoToAwaiting()
        {
            await using var context = GetInMemoryContext();
            var infracao = new Infracao
            {
                Idinfracao = 1,
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = DateTime.Today.AddDays(1)
            };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "1"),
                        new Claim("roleId", "1")
                    }))
                }
            };

            // Act & Assert: we expect StripeException but DB should already be updated
            await Assert.ThrowsAsync<StripeException>(() => controller.PagarMulta(1));
            var updated = await context.Infracoes.FindAsync(1);
            Assert.Equal("Aguardando Pagamento", updated.EstadoInfracao);
        }

        [Fact]
        public async Task GetInfracoes_Admin_ReturnsList()
        {
            await using var context = GetInMemoryContext();
            // seed minimal related data for DTO
            var login = new Login { Idlogin = 2, Email = "a@b.com" };
            context.Logins.Add(login);
            var cliente = new Cliente { Idcliente = 1, LoginIdlogin = 2, NomeCliente = "C", LoginIdloginNavigation = login };
            context.Clientes.Add(cliente);
            var marca = new MarcaVeiculo { Idmarca = 1, DescMarca = "M" };
            context.MarcaVeiculos.Add(marca);
            var modelo = new ModeloVeiculo { Idmodelo = 1, MarcaVeiculoIdmarca = 1, DescModelo = "Mod", MarcaVeiculoIdmarcaNavigation = marca };
            context.ModeloVeiculos.Add(modelo);
            var veiculo = new Veiculo { Idveiculo = 1, ModeloVeiculoIdmodelo = 1, MatriculaVeiculo = "X1", ModeloVeiculoIdmodeloNavigation = modelo };
            context.Veiculos.Add(veiculo);
            var aluguer = new Aluguer { Idaluguer = 1, ClienteIdcliente = 1, VeiculoIdveiculo = 1, ClienteIdclienteNavigation = cliente, VeiculoIdveiculoNavigation = veiculo };
            context.Aluguers.Add(aluguer);
            var infracao = new Infracao
            {
                Idinfracao = 1,
                AluguerIdaluguer = 1,
                DataInfracao = DateTime.Today,
                ValorInfracao = 5,
                DescInfracao = "d",
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = DateTime.Today.AddDays(1),
                AluguerIdaluguerNavigation = aluguer
            };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "2"),
                        new Claim("roleId", "3")
                    }))
                }
            };

            // Act
            var actionResult = await controller.GetInfracoes();

            // Assert
            var ok = Assert.IsType<OkObjectResult>(actionResult.Result);
            var dtos = Assert.IsAssignableFrom<IEnumerable<InfDTO>>(ok.Value);
            Assert.Single(dtos);
        }
    }
}
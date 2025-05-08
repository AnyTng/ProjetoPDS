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
using RESTful_API.Controllers; // Adicionado para InfDTO
using RESTful_API.Interface;
using RESTful_API.Models; // Adicionado para Infracao e outros modelos

namespace Unit_Tests
{
    public class InfracoesControllerTest : IDisposable
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
            // Configura mocks para IConfiguration, usados pelo controller para chaves Stripe e URL do frontend.
            _mockConfig.Setup(c => c["Stripe:SecretKey"]).Returns("sk_test_fake_stripe_key_for_testing"); // Chave "fake" para forçar StripeException controlada
            _mockConfig.Setup(c => c["Frontend:BaseUrl"]).Returns("https://example.com");
        }

        // Método auxiliar para obter um contexto de base de dados em memória.
        private PdsContext GetInMemoryContext()
        {
            var context = new PdsContext(_options);
            context.Database.EnsureCreated(); // Garante que a BD é criada.
            return context;
        }


        [Fact]
        public async Task CancelarMulta_Admin_SetsEstadoToCancelada()
        {
            // Arrange
            await using var context = GetInMemoryContext();

            // Semeia o Login do administrador que executará a ação.
            // O Idlogin "2" corresponde ao ClaimTypes.NameIdentifier usado abaixo.
            // HashPassword deve ser não-nulo para passar a verificação no controller.
            var adminLogin = new Login { Idlogin = 2, Email = "admin@example.com", HashPassword = "adminpass", TipoLoginIdtlogin = 3 };
            context.Logins.Add(adminLogin);

            // Semeia a Infracao a ser cancelada.
            var infracao = new Infracao { Idinfracao = 1, EstadoInfracao = "Submetida" };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            // Simula um utilizador administrador autenticado.
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "2"), // Idlogin do admin
                        new Claim("roleId", "3") // roleId para admin
                    }))
                }
            };

            // Act: Chama o método para cancelar a multa.
            var result = await controller.CancelarMulta(1);

            // Assert: Verifica se o resultado é NoContentResult e se o estado da infração foi atualizado.
            Assert.IsType<NoContentResult>(result);
            var updated = await context.Infracoes.FindAsync(1);
            Assert.NotNull(updated);
            Assert.Equal("Cancelada", updated.EstadoInfracao);
        }



        [Fact]
        public async Task CancelarMulta_Cliente_Fails()
        {
            // Arrange
            await using var context = GetInMemoryContext();

            // Semeia o Login do administrador que executará a ação.
            // O Idlogin "2" corresponde ao ClaimTypes.NameIdentifier usado abaixo.
            // HashPassword deve ser não-nulo para passar a verificação no controller.
            var clientLogin = new Login { Idlogin = 2, Email = "cliente@example.com", HashPassword = "clientepass", TipoLoginIdtlogin = 1 };
            context.Logins.Add(clientLogin);

            // Semeia a Infracao a ser cancelada.
            var infracao = new Infracao { Idinfracao = 1, EstadoInfracao = "Submetida" };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            // Simula um utilizador administrador autenticado.
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "1"), // Idlogin do Cliente
                        new Claim("roleId", "1") // roleId para o Cliente
                    }))
                }
            };

            // Act: Chama o método para cancelar a multa.
            var result = await controller.CancelarMulta(1);

            // Assert: Verifica se o resultado é NoContentResult e se o estado da infração foi atualizado.
            Assert.IsType<ForbidResult>(result);;
            var updated = await context.Infracoes.FindAsync(1);
            Assert.NotNull(updated);
            Assert.Equal("Submetida", updated.EstadoInfracao);
        }

        [Fact]
        public async Task PagarMulta_Client_UpdatesEstadoToAwaiting()
        {
            // Arrange
            await using var context = GetInMemoryContext();

            // Semeia o Login do cliente.
            // O Idlogin "1" corresponde ao ClaimTypes.NameIdentifier usado abaixo.
            // HashPassword deve ser não-nulo.
            var clientLogin = new Login { Idlogin = 1, Email = "client@example.com", HashPassword = "clientpass", TipoLoginIdtlogin = 1 };
            context.Logins.Add(clientLogin);

            // Semeia o Cliente associado ao Login.
            // Embora o método PagarMulta não use diretamente o Cliente, a Infracao está ligada a Aluguer -> Cliente.
            // Para integridade dos dados, é bom ter. O controller PagarMulta valida a Infracao.
            var cliente = new Cliente { Idcliente = 1, LoginIdlogin = clientLogin.Idlogin, NomeCliente = "Test Client", Nifcliente = 123456789 };
            context.Clientes.Add(cliente);

            // Semeia Veiculo e Aluguer para que a Infracao possa ser ligada.
            var veiculo = new Veiculo { Idveiculo = 1, MatriculaVeiculo = "AA-00-AA", ModeloVeiculoIdmodelo = 1 };
            if (!context.MarcaVeiculos.Any(m => m.Idmarca == 1)) context.MarcaVeiculos.Add(new MarcaVeiculo { Idmarca = 1, DescMarca = "TestMarca" });
            if (!context.ModeloVeiculos.Any(m => m.Idmodelo == 1)) context.ModeloVeiculos.Add(new ModeloVeiculo { Idmodelo = 1, DescModelo = "TestModelo", MarcaVeiculoIdmarca = 1 });
            context.Veiculos.Add(veiculo);

            var aluguer = new Aluguer { Idaluguer = 1, ClienteIdcliente = cliente.Idcliente, VeiculoIdveiculo = veiculo.Idveiculo };
            context.Aluguers.Add(aluguer);

            // Semeia a Infracao a ser paga.
            var infracao = new Infracao
            {
                Idinfracao = 1,
                AluguerIdaluguer = aluguer.Idaluguer, // Liga ao aluguer
                EstadoInfracao = "Submetida",
                ValorInfracao = 50, // Necessário para Stripe
                DataLimPagInfracoes = DateTime.Today.AddDays(1) // Garante que não está expirada
            };
            context.Infracoes.Add(infracao);
            await context.SaveChangesAsync();

            var controller = new InfracoesController(context, _mockEmailService.Object, _mockConfig.Object);
            // Simula um utilizador cliente autenticado.
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "1"), // Idlogin do cliente
                        new Claim("roleId", "1")  // roleId para cliente
                    }))
                }
            };

            // Act & Assert: Espera-se uma StripeException porque a chave API é "fake".
            // O estado da infração deve ser atualizado para "Aguardando Pagamento" *antes* da chamada ao Stripe.
            await Assert.ThrowsAsync<StripeException>(() => controller.PagarMulta(1));

            var updated = await context.Infracoes.FindAsync(1);
            Assert.NotNull(updated);
            Assert.Equal("Aguardando Pagamento", updated.EstadoInfracao);
        }

        [Fact]
        public async Task GetInfracoes_Admin_ReturnsList()
        {
            // Arrange
            await using var context = GetInMemoryContext();

            // Semeia o Login do administrador.
            // O Idlogin "2" é usado nos claims abaixo. HashPassword é necessário.
            var adminLogin = new Login { Idlogin = 2, Email = "a@b.com", HashPassword = "adminpass" , TipoLoginIdtlogin = 3};
            context.Logins.Add(adminLogin);

            // Semeia dados relacionados mínimos para o DTO que o controller constrói.
            var clientLogin = new Login { Idlogin = 3, Email = "client@c.com", HashPassword = "clientpass", TipoLoginIdtlogin = 1 };
            context.Logins.Add(clientLogin);

            var cliente = new Cliente { Idcliente = 1, LoginIdlogin = clientLogin.Idlogin, NomeCliente = "C", LoginIdloginNavigation = clientLogin };
            context.Clientes.Add(cliente);

            var marca = new MarcaVeiculo { Idmarca = 1, DescMarca = "M" };
            context.MarcaVeiculos.Add(marca);
            var modelo = new ModeloVeiculo { Idmodelo = 1, MarcaVeiculoIdmarca = 1, DescModelo = "Mod", MarcaVeiculoIdmarcaNavigation = marca };
            context.ModeloVeiculos.Add(modelo);
            var veiculo = new Veiculo { Idveiculo = 1, ModeloVeiculoIdmodelo = 1, MatriculaVeiculo = "X1", ModeloVeiculoIdmodeloNavigation = modelo };
            context.Veiculos.Add(veiculo);

            var aluguer = new Aluguer { Idaluguer = 1, ClienteIdcliente = cliente.Idcliente, VeiculoIdveiculo = veiculo.Idveiculo, ClienteIdclienteNavigation = cliente, VeiculoIdveiculoNavigation = veiculo };
            context.Aluguers.Add(aluguer);

            var infracao = new Infracao
            {
                Idinfracao = 1,
                AluguerIdaluguer = aluguer.Idaluguer,
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
            // Simula um utilizador administrador autenticado.
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, "2"), // Idlogin do admin
                        new Claim("roleId", "3") // roleId para admin
                    }))
                }
            };

            // Act: Chama o método GetInfracoes.
            var actionResult = await controller.GetInfracoes();

            // Assert: Verifica se o resultado é OkObjectResult e se contém a lista de DTOs.
            var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
            var dtos = Assert.IsAssignableFrom<IEnumerable<InfDTO>>(okResult.Value);
            Assert.Single(dtos); // Espera-se uma infração semeada.
        }

        public void Dispose()
        {
            // Garante que a base de dados em memória é eliminada após cada teste.
            using (var context = GetInMemoryContext())
            {
                context.Database.EnsureDeleted();
            }
        }
    }
}

using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RESTful_API.Controllers;
using RESTful_API.Models;
using RESTful_API.Interface;
using Moq;

namespace CarXpressTesteIntegracao
{
    [TestClass]
    public class TestAluguer
    {
        private PdsContext _context = null!;
        private VeiculosController _veiculosController = null!;
        private AlugueresController _alugueresController = null!;
        private DespesasController _despesasController = null!;
        private InfracoesController _infracoesController = null!;
        private Mock<IEmailService> _mockEmailService = null!;
        private Mock<IConfiguration> _mockConfig = null!;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new PdsContext(options);
            _context.Database.EnsureDeleted(); // Clear database between tests
            _context.Database.EnsureCreated();

            _veiculosController = new VeiculosController(_context);

            // Create mock email service
            _mockEmailService = new Mock<IEmailService>();

            // Create mock configuration with Stripe settings
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(config => config["Stripe:SecretKey"]).Returns("test_stripe_secret_key");

            // Set up AlugueresController with the mock configuration
            _alugueresController = new AlugueresController(_context, _mockConfig.Object);

            // Set up DespesasController with mock User claims for admin access
            _despesasController = new DespesasController(_context);

            // Set up the mock for User.Claims for DespesasController
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim("roleId", "3") // Admin role
            };
            var claimsIdentity = new ClaimsIdentity(userClaims);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            // Assign mock User to the controller
            _despesasController.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Set up InfracoesController
            _infracoesController = new InfracoesController(
                _context,
                _mockEmailService.Object,
                _mockConfig.Object
            );
        }

        [TestMethod]
        public async Task TestAddCarAndSetStatus()
        {
            // Arrange
            var veiculo = new Veiculo
            {
                MatriculaVeiculo = "AA-00-AA",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            // Act
            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            var addedVeiculo = await _context.Veiculos.FirstOrDefaultAsync(v => v.MatriculaVeiculo == "AA-00-AA");

            // Assert
            Assert.IsNotNull(addedVeiculo);
            Assert.AreEqual("Disponível", addedVeiculo.EstadoVeiculo);
        }

        [TestMethod]
        public async Task TestOpenConcursoForCar()
        {
            // Arrange
            var veiculo = new Veiculo
            {
                MatriculaVeiculo = "BB-00-BB",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            // Act
            var actionResult = await _despesasController.CriarConcurso("BB-00-BB", "Concurso de Teste");

            // Load the vehicle with its related despesas to ensure the relationship is properly tracked
            await _context.Entry(veiculo).Collection(v => v.Despesas).LoadAsync();
            var concurso = veiculo.Despesas.FirstOrDefault();

            // Alternative query if the navigation property isn't properly set
            if (concurso == null)
            {
                concurso = await _context.Despesas
                    .Include(d => d.VeiculoIdveiculoNavigation)
                    .FirstOrDefaultAsync(d => d.VeiculoIdveiculoNavigation.Idveiculo == veiculo.Idveiculo);
            }

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsNotNull(concurso);
            Assert.AreEqual("Ativo", concurso?.EstadoConcurso);

            // Also verify that the vehicle state has been updated
            var updatedVehicle = await _context.Veiculos.FindAsync(veiculo.Idveiculo);
            Assert.AreEqual("Avariado", updatedVehicle?.EstadoVeiculo);
        }

        [TestMethod]
        public async Task TestCreateAndGetAluguer()
        {
            // Arrange
            var cliente = new Cliente
            {
                NomeCliente = "Cliente Teste",
                LoginIdlogin = 101
            };

            var modeloVeiculo = new ModeloVeiculo
            {
                DescModelo = "Modelo Teste",
                MarcaVeiculoIdmarca = 1
            };
            _context.ModeloVeiculos.Add(modeloVeiculo);
            await _context.SaveChangesAsync();

            var veiculo = new Veiculo
            {
                MatriculaVeiculo = "DD-44-DD",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = modeloVeiculo.Idmodelo,
                ValorDiarioVeiculo = 50  // Valor diário necessário para o cálculo do aluguer
            };

            _context.Clientes.Add(cliente);
            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            // Verify entities were correctly added
            Assert.IsNotNull(cliente.Idcliente, "Cliente ID should not be null after save");
            Assert.IsNotNull(veiculo.Idveiculo, "Veiculo ID should not be null after save");

            // Setup client user claims for the AlugueresController
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, cliente.LoginIdlogin.ToString()),
                new Claim("roleId", "1") // Cliente role
            };
            var claimsIdentity = new ClaimsIdentity(userClaims);
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            _alugueresController.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Setup mock configuration for frontend URL
            _mockConfig.Setup(config => config["Frontend:BaseUrl"]).Returns("http://localhost:3000");

            // Act - Usar PostFazAluguer em vez de PostAluguer
            var dataLevantamento = DateTime.Now.AddDays(1);
            var dataEntregaPrevista = DateTime.Now.AddDays(4); // 3 dias de aluguer
            var createResult = await _alugueresController.PostFazAluguer(
                veiculo.Idveiculo,
                dataLevantamento,
                dataEntregaPrevista
            );

            // Debug information
            Assert.IsNotNull(createResult, "PostFazAluguer returned null");
            var okResult = createResult.Result as OkObjectResult;
            Assert.IsNotNull(okResult, "Result is not OkObjectResult");

            // A resposta contém a URL de checkout e ID do aluguer
            var resultObject = okResult?.Value;
            Assert.IsNotNull(resultObject, "Result value is null");
            Assert.IsTrue(((dynamic)resultObject).aluguerId != null, "Aluguer ID is missing in response");
            int aluguerId = (int)((dynamic)resultObject).aluguerId;

            // Verificar que o aluguer foi criado no banco de dados
            var dbAluguer = await _context.Aluguers.FindAsync(aluguerId);
            Assert.IsNotNull(dbAluguer, "Aluguer not found in database");
            Assert.AreEqual("Pendente", dbAluguer.EstadoAluguer);

            // Simular o retorno bem-sucedido do pagamento Stripe
            // Primeiro obter o aluguer com o veículo incluído
            var aluguerComVeiculo = await _context.Aluguers
                .Include(a => a.VeiculoIdveiculoNavigation)
                .FirstOrDefaultAsync(a => a.Idaluguer == aluguerId);

            Assert.IsNotNull(aluguerComVeiculo, "Aluguer with vehicle not found");
            Assert.IsNotNull(aluguerComVeiculo.VeiculoIdveiculoNavigation, "Vehicle navigation is null");

            // Atualizar status após pagamento bem-sucedido (simulando o webhook)
            aluguerComVeiculo.EstadoAluguer = "Aguarda levantamento";
            aluguerComVeiculo.VeiculoIdveiculoNavigation.EstadoVeiculo = "Alugado";
            await _context.SaveChangesAsync();

            // Agora obter o aluguer via controller
            var getResult = await _alugueresController.GetAluguer(aluguerId);
            var actionResult = getResult.Result;

            // Assert
            Assert.IsNotNull(actionResult, "GetAluguer returned null");
            var getOkResult = actionResult as OkObjectResult;
            Assert.IsNotNull(getOkResult, "Result is not OkObjectResult");

            var retrievedAluguer = getOkResult.Value as Aluguer;
            Assert.IsNotNull(retrievedAluguer, "Retrieved Aluguer is null");
            Assert.AreEqual(aluguerId, retrievedAluguer.Idaluguer);
            Assert.AreEqual("Aguarda levantamento", retrievedAluguer.EstadoAluguer);

            // Verify that the vehicle state has been updated to reflect it's being rented
            var updatedVehicle = await _context.Veiculos.FindAsync(veiculo.Idveiculo);
            Assert.IsNotNull(updatedVehicle, "Vehicle not found after update");
            Assert.AreEqual("Alugado", updatedVehicle.EstadoVeiculo);
        }

        [TestMethod]
        public async Task TestPayMulta()
        {
            // Arrange - Use unique IDs to avoid key collisions
            var cliente = new Cliente
            {
                // Don't set Idcliente explicitly, let EF Core generate it
                NomeCliente = "Test Cliente",
                LoginIdlogin = 100 // Different ID
            };

            var veiculo = new Veiculo
            {
                // Don't set Idveiculo explicitly, let EF Core generate it
                MatriculaVeiculo = "CC-00-CC",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            // Add to context and save to get generated IDs
            _context.Clientes.Add(cliente);
            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            var aluguer = new Aluguer
            {
                // Don't set Idaluguer explicitly
                VeiculoIdveiculo = veiculo.Idveiculo,
                ClienteIdcliente = cliente.Idcliente,
                DataLevantamento = DateTime.Now.AddDays(-10),
                DataEntregaPrevista = DateTime.Now.AddDays(-5),
                EstadoAluguer = "Concluido"
            };

            _context.Aluguers.Add(aluguer);
            await _context.SaveChangesAsync();

            var infracao = new Infracao
            {
                // Don't set Idinfracao explicitly
                AluguerIdaluguer = aluguer.Idaluguer,
                DataInfracao = DateTime.Now.AddDays(-7),
                ValorInfracao = 50,
                DescInfracao = "Speeding",
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = DateTime.Now.AddDays(7)
            };

            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            // Act
            var result = await _infracoesController.PagarMulta(infracao.Idinfracao);

            // Assert
            Assert.IsNotNull(result);
            var updatedInfracao = await _context.Infracoes.FirstOrDefaultAsync(i => i.Idinfracao == infracao.Idinfracao);
            Assert.IsNotNull(updatedInfracao, "Infração não foi encontrada após ser atualizada");
            Assert.AreEqual("Aguardando Pagamento", updatedInfracao?.EstadoInfracao);
        }
    }
}


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
                EstadoVeiculo    = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            // *** Simular claims de administrador ***
            var userClaims = new List<Claim>
            {
                // O valor não é usado para nada além de Parse, pode ser "1"
                new Claim(ClaimTypes.NameIdentifier, "1"),
                // roleId == 3 para passar no if (userTipoLogin != 3)
                new Claim("roleId", "3")
            };
            var identity       = new ClaimsIdentity(userClaims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);
            _despesasController.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };

            // Act
            var actionResult = await _despesasController.CriarConcurso("BB-00-BB", "Concurso de Teste");

            // Carregar as despesas no veículo
            await _context.Entry(veiculo).Collection(v => v.Despesas).LoadAsync();
            var concurso = veiculo.Despesas.FirstOrDefault();


            if (concurso == null)
            {
                concurso = await _context.Despesas
                    .Include(d => d.VeiculoIdveiculoNavigation)
                    .FirstOrDefaultAsync(d => d.VeiculoIdveiculoNavigation.Idveiculo == veiculo.Idveiculo);
            }

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsNotNull(concurso, "Esperava encontrar uma despesa 'Concurso' criada.");
            Assert.AreEqual("Ativo", concurso?.EstadoConcurso);

            // Verificar também que o estado do veículo foi alterado
            var updatedVehicle = await _context.Veiculos.FindAsync(veiculo.Idveiculo);
            Assert.AreEqual("Avariado", updatedVehicle?.EstadoVeiculo);
        }

    }
}


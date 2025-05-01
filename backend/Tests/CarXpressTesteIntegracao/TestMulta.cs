using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using RESTful_API.Controllers;
using RESTful_API.Models;
using RESTful_API.Interface;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CarXpressTesteIntegracao
{
    [TestClass]
    public class TestMulta
    {
        private PdsContext _context = null!;
        private InfracoesController _infracoesController = null!;
        private Mock<IEmailService> _mockEmailService = null!;
        private Mock<IConfiguration> _mockConfig = null!;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabaseMulta")
                .Options;

            _context = new PdsContext(options);
            _context.Database.EnsureDeleted(); // Clear database between tests
            _context.Database.EnsureCreated();

            // Create mock email service
            _mockEmailService = new Mock<IEmailService>();

            // Create mock configuration with Stripe settings
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(config => config["Stripe:SecretKey"]).Returns("test_stripe_secret_key");

            _infracoesController = new InfracoesController(
                _context,
                _mockEmailService.Object,
                _mockConfig.Object
            );
        }

        [TestMethod]
        public async Task TestCreateMulta()
        {
            // Arrange - Let the database generate IDs to avoid collisions
            var cliente = new Cliente
            {
                NomeCliente = "Test Cliente",
                LoginIdlogin = 200 // Use different ID to avoid collisions
            };

            var veiculo = new Veiculo
            {
                MatriculaVeiculo = "DD-00-DD",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            // Add and save to get generated IDs
            _context.Clientes.Add(cliente);
            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            var aluguer = new Aluguer
            {
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
                AluguerIdaluguer = aluguer.Idaluguer,
                DataInfracao = DateTime.Now.AddDays(-7),
                ValorInfracao = 75,
                DescInfracao = "Red Light",
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = DateTime.Now.AddDays(14)
            };

            // Act
            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            // Assert
            var addedInfracao = await _context.Infracoes.FirstOrDefaultAsync(i => i.AluguerIdaluguer == aluguer.Idaluguer);
            Assert.IsNotNull(addedInfracao);
            Assert.AreEqual("Red Light", addedInfracao.DescInfracao);
            Assert.AreEqual(75, addedInfracao.ValorInfracao);
            Assert.AreEqual("Submetida", addedInfracao.EstadoInfracao);
        }
    }
}

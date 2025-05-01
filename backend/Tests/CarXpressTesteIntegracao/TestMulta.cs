using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using RESTful_API.Controllers;
using RESTful_API.Models;

namespace CarXpressTesteIntegracao
{
    [TestClass]
    public class TestMulta
    {
        private PdsContext _context;
        private InfracoesController _infracoesController;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new PdsContext(options);
            _infracoesController = new InfracoesController(_context, null, null);
        }

        [TestMethod]
        public async Task TestCreateMulta()
        {
            // Arrange
            var cliente = new Cliente
            {
                Idcliente = 1,
                NomeCliente = "Test Cliente",
                LoginIdlogin = 1
            };

            var veiculo = new Veiculo
            {
                Idveiculo = 1,
                MatriculaVeiculo = "DD-00-DD",
                EstadoVeiculo = "Disponível",
                ModeloVeiculoIdmodelo = 1
            };

            var aluguer = new Aluguer
            {
                Idaluguer = 1,
                VeiculoIdveiculo = veiculo.Idveiculo,
                ClienteIdcliente = cliente.Idcliente,
                DataLevantamento = DateTime.Now.AddDays(-10),
                DataEntregaPrevista = DateTime.Now.AddDays(-5),
                EstadoAluguer = "Concluido"
            };

            _context.Clientes.Add(cliente);
            _context.Veiculos.Add(veiculo);
            _context.Aluguers.Add(aluguer);
            await _context.SaveChangesAsync();

            // Act
            var result = await _infracoesController.InserirMulta(DateTime.Now.AddDays(-7), 100, "DD-00-DD", "Parking Violation", DateTime.Now.AddDays(7));

            // Assert
            Assert.IsNotNull(result);
            var createdInfracao = await _context.Infracoes.FirstOrDefaultAsync(i => i.AluguerIdaluguer == aluguer.Idaluguer);
            Assert.IsNotNull(createdInfracao);
            Assert.AreEqual("Submetida", createdInfracao.EstadoInfracao);
        }
    }
}

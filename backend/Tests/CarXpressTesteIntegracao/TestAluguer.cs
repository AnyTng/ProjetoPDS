using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using RESTful_API.Controllers;
using RESTful_API.Models;

namespace CarXpressTesteIntegracao
{
    [TestClass]
    public class TestAluguer
    {
        private PdsContext _context;
        private VeiculosController _veiculosController;
        private DespesasController _despesasController;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new PdsContext(options);
            _veiculosController = new VeiculosController(_context);
            _despesasController = new DespesasController(_context);
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
            var result = await _despesasController.CriarConcurso("BB-00-BB", "Concurso de Teste");

            var concurso = await _context.Despesas.FirstOrDefaultAsync(d => d.VeiculoIdveiculo == veiculo.Idveiculo);

            // Assert
            Assert.IsNotNull(concurso);
            Assert.AreEqual("Ativo", concurso.EstadoConcurso);
        }
    }
}

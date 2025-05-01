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
        private InfracoesController _infracoesController;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new PdsContext(options);
            _veiculosController = new VeiculosController(_context);
            _despesasController = new DespesasController(_context);
            _infracoesController = new InfracoesController(_context, null, null);
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

        [TestMethod]
        public async Task TestPayMulta()
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
                MatriculaVeiculo = "CC-00-CC",
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

            var infracao = new Infracao
            {
                Idinfracao = 1,
                AluguerIdaluguer = aluguer.Idaluguer,
                DataInfracao = DateTime.Now.AddDays(-7),
                ValorInfracao = 50,
                DescInfracao = "Speeding",
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = DateTime.Now.AddDays(7)
            };

            _context.Clientes.Add(cliente);
            _context.Veiculos.Add(veiculo);
            _context.Aluguers.Add(aluguer);
            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            // Act
            var result = await _infracoesController.PagarMulta(infracao.Idinfracao);

            // Assert
            Assert.IsNotNull(result);
            var updatedInfracao = await _context.Infracoes.FirstOrDefaultAsync(i => i.Idinfracao == infracao.Idinfracao);
            Assert.AreEqual("Aguardando Pagamento", updatedInfracao.EstadoInfracao);
        }
    }
}

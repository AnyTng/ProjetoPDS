using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using RESTful_API.Controllers;
using RESTful_API.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CarXpressTesteIntegracao
{
    [TestClass]
    public class TestCarroConcurso
    {
        private PdsContext? _context;
        private DespesasController? _despesasController;

        [TestInitialize]
        public void Initialize()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new PdsContext(options);
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

            // Mock user for controller as an administrator
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1"),  // must be an int
                new Claim("roleId",                "3")   // 3 == administrator
            };
            var identity = new ClaimsIdentity(claims, "mock");
            var user = new ClaimsPrincipal(identity);

            _despesasController.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            await _despesasController.CriarConcurso("BB-00-BB", "Concurso de Teste");

            var concurso = await _context.Despesas.FirstOrDefaultAsync(d => d.VeiculoIdveiculo == veiculo.Idveiculo);

            // Assert
            Assert.IsNotNull(concurso);
            Assert.AreEqual("Ativo", concurso.EstadoConcurso);
        }
    }
}

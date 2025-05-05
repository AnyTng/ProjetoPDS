// filepath: /Users/anytng/Documents/Developer/Aulinhas/PDS/ProjetoPDS/backend/Tests/CarXPress Unit Tests/DespesasControllerTests.cs

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using RESTful_API.Controllers;
using RESTful_API.Models;
using Xunit;

namespace Unit_Tests
{
    public class DespesasControllerTests
    {
        private readonly PdsContext _context;
        private readonly DespesasController _controller;

        public DespesasControllerTests()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new PdsContext(options);
            _controller = new DespesasController(_context);
        }

        private ClaimsPrincipal GetUser(int userId, int roleId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("roleId", roleId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        [Fact]
        public async Task GetConcursos_ReturnsForbid_WhenNotAdmin()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1,2) } };
            var result = await _controller.GetConcursos();
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task GetConcursos_ReturnsList_WhenAdmin()
        {
            // seed marca->modelo->veiculo->despesa
            var marca = new MarcaVeiculo { Idmarca = 1, DescMarca = "M" };
            var modelo = new ModeloVeiculo { Idmodelo = 2, DescModelo = "X", MarcaVeiculoIdmarca = 1 };
            var veiculo = new Veiculo { Idveiculo = 3, MatriculaVeiculo = "A1", ModeloVeiculoIdmodelo = 2 };
            var desp = new Despesa { Iddespesa = 4, VeiculoIdveiculo = 3 };
            _context.MarcaVeiculos.Add(marca);
            _context.ModeloVeiculos.Add(modelo);
            _context.Veiculos.Add(veiculo);
            _context.Despesas.Add(desp);
            await _context.SaveChangesAsync();

            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1,3) } };
            var result = await _controller.GetConcursos();
            result.Value.Should().HaveCount(1);
        }

        [Fact]
        public async Task CriarConcurso_Success_SetsFieldsAndVehicleState()
        {
            var veiculo = new Veiculo { Idveiculo = 10, MatriculaVeiculo = "M1", EstadoVeiculo = "Disponível" };
            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1,3) } };
            var result = await _controller.CriarConcurso("M1","desc");
            var created = result.Result as CreatedAtActionResult;
            created.Should().NotBeNull();
            var output = created.Value as Despesa;
            output.DescConcurso.Should().Be("desc");
            output.EstadoConcurso.Should().Be("Ativo");
            _context.Veiculos.Find(10).EstadoVeiculo.Should().Be("Avariado");
        }

        [Fact]
        public async Task CancelarConcurso_Success_CancelsAllManutencoes()
        {
            var desp = new Despesa { Iddespesa = 5, EstadoConcurso = "Ativo" };
            var m1 = new Manutencao { Idmanutencao = 6, DespesaIddespesa = 5, EstadoProposta = "Pendente" };
            var m2 = new Manutencao { Idmanutencao = 7, DespesaIddespesa = 5, EstadoProposta = "Pendente" };
            _context.Despesas.Add(desp);
            _context.Manutencaos.AddRange(m1,m2);
            await _context.SaveChangesAsync();

            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1,3) } };
            var result = await _controller.CancelarConcurso(5);
            result.Should().BeOfType<NoContentResult>();
            _context.Despesas.Find(5).EstadoConcurso.Should().Be("Cancelado");
            _context.Manutencaos.Find(6).EstadoProposta.Should().Be("Cancelada");
            _context.Manutencaos.Find(7).EstadoProposta.Should().Be("Cancelada");
        }

        [Fact]
        public async Task TerminoConcurso_Success_UpdatesEndAndVehicle()
        {
            var veic = new Veiculo { Idveiculo = 20, EstadoVeiculo = "Avariado" };
            var desp = new Despesa { Iddespesa = 8, VeiculoIdveiculo = 20, EstadoConcurso = "Ativo" };
            _context.Veiculos.Add(veic);
            _context.Despesas.Add(desp);
            await _context.SaveChangesAsync();

            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1,3) } };
            var result = await _controller.TerminoConcurso(8);
            result.Should().BeOfType<NoContentResult>();
            var updated = _context.Despesas.Find(8);
            updated.EstadoConcurso.Should().Be("Concluido");
            updated.DataFim.Should().NotBeNull();
            _context.Veiculos.Find(20).EstadoVeiculo.Should().Be("Disponível");
        }



        [Fact]
        public async Task SubmeterFatura_Success_UploadsPdfAndUpdatesPath()
        {
            var desp = new Despesa { Iddespesa = 11 };
            _context.Despesas.Add(desp);
            await _context.SaveChangesAsync();

            var content = Encoding.UTF8.GetBytes("pdfcontent");
            var stream = new MemoryStream(content);
            var formFile = new FormFile(stream, 0, content.Length, "data", "test.pdf");

            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(3,2) } };
            var result = await _controller.SubmeterFatura(11, formFile);
            result.Should().BeOfType<NoContentResult>();
            var updated = _context.Despesas.Find(11);
            updated.EstadoConcurso.Should().Be("Fatura Submetida");
            updated.CaminhoFaturaPDF.Should().Contain("test.pdf");
        }

        [Fact]
        public async Task DownloadFatura_Success_ReturnsFileStream()
        {
            // create file
            var relPath = Path.Combine("assets/pdfManut", "11", "f.pdf");
            var absDir = Path.Combine(Directory.GetCurrentDirectory(), "assets/pdfManut", "11");
            Directory.CreateDirectory(absDir);
            var absFile = Path.Combine(Directory.GetCurrentDirectory(), relPath);
            File.WriteAllText(absFile, "data");

            _context.Despesas.Add(new Despesa { Iddespesa = 11, CaminhoFaturaPDF = relPath.Replace(Path.DirectorySeparatorChar,'/') });
            await _context.SaveChangesAsync();

            var result = await _controller.DownloadFatura(11) as FileStreamResult;
            result.Should().NotBeNull();
            result.ContentType.Should().Be("application/pdf");
            result.FileDownloadName.Should().Be("f.pdf");
        }
    }
}

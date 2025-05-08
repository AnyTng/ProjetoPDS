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
    public class DespesasControllerTests : IDisposable
    {
        private readonly PdsContext _context;
        private DespesasController _controller;

        public DespesasControllerTests()
        {
            // Configura uma base de dados em memória única para cada execução da classe de testes.
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new PdsContext(options);
            _controller = new DespesasController(_context);
        }

        // Método auxiliar para criar um ClaimsPrincipal para simular um utilizador autenticado.
        private ClaimsPrincipal GetUser(int userId, int roleId, string email = "test@example.com")
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()), // ID do Login do utilizador
                new Claim("roleId", roleId.ToString()), // Tipo de Login (Role)
                new Claim(ClaimTypes.Email, email) // Email do utilizador
            };
            var identity = new ClaimsIdentity(claims, "TestAuth"); // "TestAuth" como esquema de autenticação
            return new ClaimsPrincipal(identity);
        }

        // Método auxiliar para semear um utilizador Login de administrador.
        private void SeedAdminUser(int userId = 1, string email = "admin@example.com")
        {
            if (!_context.Logins.Any(l => l.Idlogin == userId))
            {
                _context.Logins.Add(new Login { Idlogin = userId, Email = email, HashPassword = "adminpassword", TipoLoginIdtlogin = 3 }); // roleId 3 = Admin
                _context.SaveChanges();
            }
        }

        // Método auxiliar para semear um utilizador Login de empresa e a entidade Empresa associada.
        private void SeedEmpresaUserAndEmpresa(int userId = 2, int empresaId = 1, string email = "empresa@example.com")
        {
            if (!_context.Logins.Any(l => l.Idlogin == userId))
            {
                _context.Logins.Add(new Login { Idlogin = userId, Email = email, HashPassword = "empresapassword", TipoLoginIdtlogin = 2 }); // roleId 2 = Empresa
            }
            if (!_context.Empresas.Any(e => e.Idempresa == empresaId))
            {
                _context.Empresas.Add(new Empresa { Idempresa = empresaId, NomeEmpresa = "Test Empresa", LoginIdlogin = userId });
            }
            _context.SaveChanges();
        }


        [Fact]
        public async Task GetConcursos_ReturnsForbid_WhenNotAdmin()
        {
            // Arrange: Configura o contexto do controller com um utilizador não-admin (roleId 2 - Empresa).
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 2) } };
            // Semeia o Login para o utilizador não-admin, pois o controller verifica HashPassword.
            _context.Logins.Add(new Login { Idlogin = 1, Email = "test@example.com", HashPassword = "password", TipoLoginIdtlogin = 2 });
            await _context.SaveChangesAsync();

            // Act: Chama o método GetConcursos.
            var result = await _controller.GetConcursos();

            // Assert: Verifica se o resultado é ForbidResult, indicando acesso negado.
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task GetConcursos_ReturnsList_WhenAdmin()
        {
            // Arrange: Semeia um utilizador admin e configura o controller.
            SeedAdminUser(1);
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 3) } };

            // Semeia entidades relacionadas para uma Despesa.
            var marca = new MarcaVeiculo { Idmarca = 1, DescMarca = "M" };
            var modelo = new ModeloVeiculo { Idmodelo = 2, DescModelo = "X", MarcaVeiculoIdmarca = marca.Idmarca };
            var veiculo = new Veiculo { Idveiculo = 3, MatriculaVeiculo = "A1", ModeloVeiculoIdmodelo = modelo.Idmodelo };
            // A entidade Despesa representa um concurso; EstadoConcurso é relevante.
            var desp = new Despesa { Iddespesa = 4, VeiculoIdveiculo = veiculo.Idveiculo, EstadoConcurso = "Ativo" };

            _context.MarcaVeiculos.Add(marca);
            _context.ModeloVeiculos.Add(modelo);
            _context.Veiculos.Add(veiculo);
            _context.Despesas.Add(desp);
            await _context.SaveChangesAsync();

            // Act: Chama o método GetConcursos.
            var result = await _controller.GetConcursos(); // result é ActionResult<IEnumerable<Despesa>>

            // Assert: Verifica que a ação foi bem-sucedida e retornou os dados esperados.
            result.Result.Should().BeNull(); // Indica que o valor (T) foi retornado diretamente, implicando um status 200 OK.
            result.Value.Should().NotBeNull(); // O valor retornado não deve ser nulo.
            result.Value.Should().BeAssignableTo<IEnumerable<Despesa>>(); // O valor deve ser do tipo esperado (IEnumerable<Despesa>).

            var despesasList = result.Value; // despesasList é IEnumerable<Despesa>
            despesasList.Should().HaveCount(1); // Verifica a contagem dos itens.
        }

        [Fact]
        public async Task CriarConcurso_Success_SetsFieldsAndVehicleState()
        {
            // Arrange: Semeia um utilizador admin.
            SeedAdminUser(1);
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 3) } };

            // Semeia um Veiculo para ser associado ao novo concurso.
            var veiculo = new Veiculo { Idveiculo = 10, MatriculaVeiculo = "M1", EstadoVeiculo = "Disponível", ModeloVeiculoIdmodelo = 1 };
            // Semeia MarcaVeiculo e ModeloVeiculo mínimos para satisfazer restrições de chave estrangeira.
            if (!_context.MarcaVeiculos.Any(m => m.Idmarca == 1))
                _context.MarcaVeiculos.Add(new MarcaVeiculo { Idmarca = 1, DescMarca = "TestMarca" });
            if (!_context.ModeloVeiculos.Any(m => m.Idmodelo == 1))
                _context.ModeloVeiculos.Add(new ModeloVeiculo { Idmodelo = 1, DescModelo = "TestModelo", MarcaVeiculoIdmarca = 1 });

            _context.Veiculos.Add(veiculo);
            await _context.SaveChangesAsync();

            // Act: Chama o método CriarConcurso.
            var result = await _controller.CriarConcurso("M1", "desc");

            // Assert: Verifica se o concurso foi criado corretamente e o estado do veículo atualizado.
            var created = result.Result as CreatedAtActionResult;
            created.Should().NotBeNull();
            var output = created.Value as Despesa;
            output.Should().NotBeNull();
            output.DescConcurso.Should().Be("desc");
            output.EstadoConcurso.Should().Be("Ativo");

            var updatedVeiculo = await _context.Veiculos.FindAsync(10);
            updatedVeiculo.EstadoVeiculo.Should().Be("Avariado");
        }

        [Fact]
        public async Task CancelarConcurso_Success_CancelsAllManutencoes()
        {
            // Arrange: Semeia um utilizador admin.
            SeedAdminUser(1);
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 3) } };

            // Semeia uma Despesa (concurso) e Manutencoes associadas.
            var desp = new Despesa { Iddespesa = 5, EstadoConcurso = "Ativo" };
            var m1 = new Manutencao { Idmanutencao = 6, DespesaIddespesa = desp.Iddespesa, EstadoProposta = "Pendente" };
            var m2 = new Manutencao { Idmanutencao = 7, DespesaIddespesa = desp.Iddespesa, EstadoProposta = "Pendente" };
            _context.Despesas.Add(desp);
            _context.Manutencaos.AddRange(m1, m2);
            await _context.SaveChangesAsync();

            // Act: Chama o método CancelarConcurso.
            var result = await _controller.CancelarConcurso(desp.Iddespesa);

            // Assert: Verifica se a operação foi bem-sucedida e os estados foram atualizados.
            result.Should().BeOfType<NoContentResult>();

            var updatedDespesa = await _context.Despesas.FindAsync(desp.Iddespesa);
            updatedDespesa.EstadoConcurso.Should().Be("Cancelado");

            var updatedM1 = await _context.Manutencaos.FindAsync(m1.Idmanutencao);
            updatedM1.EstadoProposta.Should().Be("Cancelada");
            var updatedM2 = await _context.Manutencaos.FindAsync(m2.Idmanutencao);
            updatedM2.EstadoProposta.Should().Be("Cancelada");
        }

        [Fact]
        public async Task TerminoConcurso_Success_UpdatesEndAndVehicle()
        {
            // Arrange: Semeia um utilizador admin.
            SeedAdminUser(1);
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 3) } };

            // Semeia um Veiculo e uma Despesa (concurso) associada.
            var veic = new Veiculo { Idveiculo = 20, EstadoVeiculo = "Avariado", ModeloVeiculoIdmodelo = 1 };
            var desp = new Despesa { Iddespesa = 8, VeiculoIdveiculo = veic.Idveiculo, EstadoConcurso = "Ativo" };

            if (!_context.MarcaVeiculos.Any(m => m.Idmarca == 1))
                _context.MarcaVeiculos.Add(new MarcaVeiculo { Idmarca = 1, DescMarca = "TestMarca" });
            if (!_context.ModeloVeiculos.Any(m => m.Idmodelo == 1))
                _context.ModeloVeiculos.Add(new ModeloVeiculo { Idmodelo = 1, DescModelo = "TestModelo", MarcaVeiculoIdmarca = 1 });

            _context.Veiculos.Add(veic);
            _context.Despesas.Add(desp);
            await _context.SaveChangesAsync();

            // Act: Chama o método TerminoConcurso.
            var result = await _controller.TerminoConcurso(desp.Iddespesa);

            // Assert: Verifica se a operação foi bem-sucedida e os estados/datas foram atualizados.
            result.Should().BeOfType<NoContentResult>();

            var updated = await _context.Despesas.FindAsync(desp.Iddespesa);
            updated.EstadoConcurso.Should().Be("Concluido");
            updated.DataFim.Should().NotBeNull().And.BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5)); // DataFim é definida como DateTime.Now

            var updatedVeiculo = await _context.Veiculos.FindAsync(veic.Idveiculo);
            updatedVeiculo.EstadoVeiculo.Should().Be("Disponível");
        }

        [Fact]
        public async Task SubmeterFatura_Success_UploadsPdfAndUpdatesPath()
        {
            // Arrange: Define IDs e semeia utilizador empresa e entidade Empresa.
            int empresaLoginId = 2;
            int empresaId = 1;
            int despesaId = 11;

            SeedEmpresaUserAndEmpresa(empresaLoginId, empresaId);
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(empresaLoginId, 2) } };

            // Semeia Veiculo, Despesa (concurso), e Manutencao com EstadoProposta "Aceite".
            // A lógica do controller SubmeterFatura não valida se a proposta está "Aceite" ou se pertence à empresa,
            // mas semear desta forma representa um cenário válido.
            var veiculo = new Veiculo { Idveiculo = 30, MatriculaVeiculo = "F1", ModeloVeiculoIdmodelo = 1, EstadoVeiculo = "Avariado" };
            var desp = new Despesa { Iddespesa = despesaId, VeiculoIdveiculo = veiculo.Idveiculo, EstadoConcurso = "Ativo" };
            var manut = new Manutencao {
                Idmanutencao = 100,
                DespesaIddespesa = desp.Iddespesa,
                EmpresaIdempresa = empresaId, // Ligação à empresa que submete
                EstadoProposta = "Aceite"
            };

            if (!_context.MarcaVeiculos.Any(m => m.Idmarca == 1))
                _context.MarcaVeiculos.Add(new MarcaVeiculo { Idmarca = 1, DescMarca = "TestMarca" });
            if (!_context.ModeloVeiculos.Any(m => m.Idmodelo == 1))
                _context.ModeloVeiculos.Add(new ModeloVeiculo { Idmodelo = 1, DescModelo = "TestModelo", MarcaVeiculoIdmarca = 1 });

            _context.Veiculos.Add(veiculo);
            _context.Despesas.Add(desp);
            _context.Manutencaos.Add(manut);
            await _context.SaveChangesAsync();

            // Prepara um IFormFile mock.
            var content = Encoding.UTF8.GetBytes("pdfcontent");
            var stream = new MemoryStream(content);
            var formFile = new FormFile(stream, 0, content.Length, "data", "test.pdf")
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/pdf"
            };

            // Act: Chama o método SubmeterFatura.
            var result = await _controller.SubmeterFatura(desp.Iddespesa, formFile);

            // Assert: Verifica se a operação foi bem-sucedida e os campos da despesa atualizados.
            result.Should().BeOfType<NoContentResult>();

            var updatedDespesa = await _context.Despesas.FindAsync(desp.Iddespesa);
            updatedDespesa.Should().NotBeNull();
            updatedDespesa.EstadoConcurso.Should().Be("Fatura Submetida");
            updatedDespesa.CaminhoFaturaPDF.Should().NotBeNullOrEmpty().And.Contain("test.pdf");

            // Cleanup: Remove o ficheiro PDF criado durante o teste.
            if (!string.IsNullOrEmpty(updatedDespesa.CaminhoFaturaPDF))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), updatedDespesa.CaminhoFaturaPDF.Replace('/', Path.DirectorySeparatorChar));
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    var dirPath = Path.GetDirectoryName(filePath);
                    if (Directory.Exists(dirPath) && !Directory.EnumerateFileSystemEntries(dirPath).Any())
                    {
                        try { Directory.Delete(dirPath, false); } catch { /* Ignorar erros de cleanup */ }
                    }
                }
            }
        }

        [Fact]
        public async Task DownloadFatura_Success_ReturnsFileStream()
        {
            // Arrange: Define ID da despesa.
            // O método DownloadFatura no controller não parece ter autenticação/autorização.
            int despesaId = 11;

            // Prepara um ficheiro mock para download.
            var relDir = Path.Combine("assets", "pdfManut", despesaId.ToString());
            var relPath = Path.Combine(relDir, "f.pdf");

            var absDir = Path.Combine(Directory.GetCurrentDirectory(), relDir);
            Directory.CreateDirectory(absDir);
            var absFile = Path.Combine(absDir, "f.pdf");
            await File.WriteAllTextAsync(absFile, "pdf file content");

            // Semeia uma Despesa com o caminho para o PDF mock.
            _context.Despesas.Add(new Despesa { Iddespesa = despesaId, CaminhoFaturaPDF = relPath.Replace(Path.DirectorySeparatorChar, '/') });
            await _context.SaveChangesAsync();

            // Act: Chama o método DownloadFatura.
            var result = await _controller.DownloadFatura(despesaId);

            // Assert: Verifica se o resultado é um FileStreamResult com os detalhes corretos.
            result.Should().BeOfType<FileStreamResult>();
            var fileResult = result as FileStreamResult;
            fileResult.ContentType.Should().Be("application/pdf");
            fileResult.FileDownloadName.Should().Be("f.pdf");

            // Cleanup: Remove o ficheiro mock e o diretório.
            if (File.Exists(absFile))
            {
                File.Delete(absFile);
            }
            if (Directory.Exists(absDir) && !Directory.EnumerateFileSystemEntries(absDir).Any())
            {
                 try { Directory.Delete(absDir, false); } catch { /* Ignorar erros de cleanup */ }
            }
        }

        public void Dispose()
        {
            // Garante que a base de dados em memória é eliminada após cada execução de teste para isolamento.
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}

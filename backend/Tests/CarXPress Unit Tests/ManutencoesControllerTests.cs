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
using Xunit;
using RESTful_API.Controllers; // Para DTOs se existirem no ManutencoesController
using RESTful_API.Interface;
using RESTful_API.Models;
using FluentAssertions; // Para asserções mais legíveis

namespace Unit_Tests
{
    public class ManutencoesControllerTests : IDisposable
    {
        private readonly DbContextOptions<PdsContext> _options;
        private readonly Mock<IEmailService> _mockEmailService;
        // Adicione outros mocks se o seu ManutencoesController os injetar (ex: IConfiguration)

        public ManutencoesControllerTests()
        {
            _options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _mockEmailService = new Mock<IEmailService>();
            // Inicialize outros mocks aqui, se necessário
        }

        private PdsContext GetInMemoryContext()
        {
            var context = new PdsContext(_options);
            context.Database.EnsureCreated();
            return context;
        }

        // Método auxiliar para criar um ClaimsPrincipal para simular um utilizador autenticado.
        private ClaimsPrincipal GetUser(int userId, int roleId, string email = "test@example.com")
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("roleId", roleId.ToString()),
                new Claim(ClaimTypes.Email, email)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        // Método auxiliar para semear um utilizador Login de administrador.
        private Login SeedAdminUser(PdsContext context, int userId = 1, string email = "admin@example.com")
        {
            var adminLogin = context.Logins.FirstOrDefault(l => l.Idlogin == userId);
            if (adminLogin == null)
            {
                adminLogin = new Login { Idlogin = userId, Email = email, HashPassword = "admin_password_secure", TipoLoginIdtlogin = 3 };
                context.Logins.Add(adminLogin);
            }
            else
            {
                adminLogin.Email = email; // Garante que o email está atualizado
                if (adminLogin.HashPassword == null) // Garante que tem HashPassword
                {
                    adminLogin.HashPassword = "admin_password_secure";
                }
            }
            context.SaveChanges();
            return adminLogin;
        }

        // Método auxiliar para semear um utilizador Login de empresa e a entidade Empresa associada.
        private (Login empresaLogin, Empresa empresa) SeedEmpresaUserAndEmpresa(PdsContext context, int userId = 2, int empresaId = 1, string email = "empresa@example.com")
        {
            var empresaLogin = context.Logins.FirstOrDefault(l => l.Idlogin == userId);
            if (empresaLogin == null)
            {
                empresaLogin = new Login { Idlogin = userId, Email = email, HashPassword = "empresa_password_secure", TipoLoginIdtlogin = 2 };
                context.Logins.Add(empresaLogin);
            }
            else
            {
                empresaLogin.Email = email; // Garante que o email está atualizado
                if (empresaLogin.HashPassword == null)
                {
                    empresaLogin.HashPassword = "empresa_password_secure";
                }
            }

            var empresa = context.Empresas.FirstOrDefault(e => e.Idempresa == empresaId);
            if (empresa == null)
            {
                empresa = new Empresa { Idempresa = empresaId, NomeEmpresa = "Test Empresa Ltd", LoginIdlogin = userId };
                context.Empresas.Add(empresa);
            }
            // Associar o Login semeado/encontrado à navegação da empresa, se ainda não estiver
            // e se o controller precisar desta navegação para obter o email.
            if (empresa.LoginIdloginNavigation == null || empresa.LoginIdloginNavigation.Idlogin != empresaLogin.Idlogin)
            {
                 empresa.LoginIdloginNavigation = empresaLogin;
            }

            context.SaveChanges();
            return (empresaLogin, empresa);
        }

        // Semeia uma Despesa (concurso) e o Veiculo associado.
        private Despesa SeedDespesaAndVeiculo(PdsContext context, int despesaId = 1, int veiculoId = 1, string matricula = "AA-00-AA")
        {
            var veiculo = context.Veiculos.FirstOrDefault(v => v.Idveiculo == veiculoId);
            if (veiculo == null)
            {
                // Adiciona Marca e Modelo se não existirem para satisfazer FKs
                if (!context.MarcaVeiculos.Any(m => m.Idmarca == 1))
                    context.MarcaVeiculos.Add(new MarcaVeiculo { Idmarca = 1, DescMarca = "TestMarca" });
                if (!context.ModeloVeiculos.Any(m => m.Idmodelo == 1))
                    context.ModeloVeiculos.Add(new ModeloVeiculo { Idmodelo = 1, DescModelo = "TestModelo", MarcaVeiculoIdmarca = 1 });

                veiculo = new Veiculo { Idveiculo = veiculoId, MatriculaVeiculo = matricula, ModeloVeiculoIdmodelo = 1, EstadoVeiculo = "Avariado" };
                context.Veiculos.Add(veiculo);
            }

            var despesa = context.Despesas.FirstOrDefault(d => d.Iddespesa == despesaId);
            if (despesa == null)
            {
                despesa = new Despesa { Iddespesa = despesaId, VeiculoIdveiculo = veiculoId, DescConcurso = "Concurso Teste", EstadoConcurso = "Ativo", DataInicio = DateTime.UtcNow, VeiculoIdveiculoNavigation = veiculo };
                context.Despesas.Add(despesa);
            }
            else if (despesa.VeiculoIdveiculoNavigation == null) // Garante que a navegação do veículo está definida
            {
                despesa.VeiculoIdveiculoNavigation = veiculo;
            }
            context.SaveChanges();
            return despesa;
        }


        [Fact]
        public async Task AceitarProposta_ReturnsNotFound_WhenPropostaMissing()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new ManutencoesController(context, _mockEmailService.Object);

            var adminLogin = SeedAdminUser(context, 1);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(adminLogin.Idlogin, 3) } };

            // Act
            // Tenta aceitar uma proposta com um ID que não existe.
            var result = await controller.AceitarProposta(999);

            // Assert
            // Espera-se NotFoundResult, pois o controller deve retornar NotFound se a proposta não for encontrada.
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task AceitarProposta_ValidProposal_UpdatesStateAndSendsEmail()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new ManutencoesController(context, _mockEmailService.Object);

            var adminLogin = SeedAdminUser(context, 1);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(adminLogin.Idlogin, 3) } };

            // Semeia a empresa que fez a proposta aceite e o seu login associado
            var (empresaAceiteLogin, empresaAceite) = SeedEmpresaUserAndEmpresa(context, userId: 2, empresaId: 1, email: "empresa.aceite@example.com");
            var despesa = SeedDespesaAndVeiculo(context, 1, 1);

            // Semeia a proposta que será aceite
            var propostaAceite = new Manutencao
            {
                Idmanutencao = 1,
                DespesaIddespesa = despesa.Iddespesa,
                EmpresaIdempresa = empresaAceite.Idempresa,
                DescProposta = "Proposta válida",
                ValorProposta = 100,
                EstadoProposta = "Pendente",
                DespesaIddespesaNavigation = despesa,
                EmpresaIdempresaNavigation = empresaAceite
            };
            context.Manutencaos.Add(propostaAceite);

            // Semeia outra empresa e sua proposta, que será rejeitada
            var (empresaRejeitadaLogin, empresaRejeitada) = SeedEmpresaUserAndEmpresa(context, userId: 3, empresaId: 2, email: "empresa.rejeitada@example.com");

            var propostaRejeitada = new Manutencao
            {
                Idmanutencao = 2,
                DespesaIddespesa = despesa.Iddespesa,
                EmpresaIdempresa = empresaRejeitada.Idempresa,
                DescProposta = "Outra proposta",
                ValorProposta = 120,
                EstadoProposta = "Pendente",
                EmpresaIdempresaNavigation = empresaRejeitada
            };
            context.Manutencaos.Add(propostaRejeitada);
            await context.SaveChangesAsync();

            // Act
            var result = await controller.AceitarProposta(propostaAceite.Idmanutencao);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            var updatedPropostaAceite = await context.Manutencaos.FindAsync(propostaAceite.Idmanutencao);
            updatedPropostaAceite.Should().NotBeNull();
            updatedPropostaAceite.EstadoProposta.Should().Be("Aceite");

            var updatedPropostaRejeitada = await context.Manutencaos.FindAsync(propostaRejeitada.Idmanutencao);
            updatedPropostaRejeitada.Should().NotBeNull();
            updatedPropostaRejeitada.EstadoProposta.Should().Be("Rejeitada");

            // Verifica o email para a empresa da proposta aceite
            _mockEmailService.Verify(
                emailService => emailService.EnviarEmail(
                    empresaAceiteLogin.Email, // Usa o email do Login da empresa aceite
                    It.Is<string>(s => s.Contains("Proposta Aceite")),
                    It.IsAny<string>()
                ), Times.Once);

            // REMOVIDO: O controller não envia email para propostas rejeitadas nesta ação.
            // _mockEmailService.Verify(
            //     emailService => emailService.EnviarEmail(
            //         empresaRejeitadaLogin.Email,
            //         It.Is<string>(s => s.Contains("Proposta de Manutenção Rejeitada") || s.Contains("Proposta Rejeitada")),
            //         It.IsAny<string>()
            //     ), Times.Once);
        }

        [Fact]
        public async Task FazerProposta_ReturnsCreated_WhenValid()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new ManutencoesController(context, _mockEmailService.Object);

            var (empresaLogin, empresa) = SeedEmpresaUserAndEmpresa(context, 2, 1);
            controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(empresaLogin.Idlogin, 2) } };

            var despesa = SeedDespesaAndVeiculo(context, 1, 1);

            string descProposta = "Nova proposta de teste";
            float valorProposta = 150.75f;
            DateTime dataInicioMan = DateTime.UtcNow.Date;
            DateTime dataFimMan = DateTime.UtcNow.Date.AddDays(5);

            // Act
            var result = await controller.FazerProposta(despesa.Iddespesa, descProposta, valorProposta, dataInicioMan, dataFimMan);

            // Assert
            result.Result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = result.Result as CreatedAtActionResult;
            var manutencaoCriada = createdResult.Value as Manutencao;

            manutencaoCriada.Should().NotBeNull();
            manutencaoCriada.DescProposta.Should().Be(descProposta);
            manutencaoCriada.ValorProposta.Should().Be(valorProposta);
            manutencaoCriada.EmpresaIdempresa.Should().Be(empresa.Idempresa);
            manutencaoCriada.EstadoProposta.Should().Be("Pendente");
            manutencaoCriada.DataInicioMan.Should().Be(dataInicioMan);
            manutencaoCriada.DataFimMan.Should().Be(dataFimMan);
        }

        public void Dispose()
        {
            using (var context = GetInMemoryContext())
            {
                context.Database.EnsureDeleted();
            }
        }
    }
}

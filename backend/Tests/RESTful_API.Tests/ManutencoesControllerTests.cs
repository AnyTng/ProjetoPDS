using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using RESTful_API.Controllers;
using RESTful_API.Interface;
using RESTful_API.Models;
using Xunit;

namespace RESTful_API.Tests
{
    public class ManutençõesCntrollerTests
    {
        private readonly PdsContext _context;
        private readonly ManutencoesController _controller;
        private readonly Mock<IEmailService> _emailServiceMock;

        public ManutençõesCntrollerTests()
        {
            var options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new PdsContext(options);
            _emailServiceMock = new Mock<IEmailService>();
            _controller = new ManutencoesController(_context, _emailServiceMock.Object);
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
        public async Task FazerProposta_ReturnsCreated_WhenValid()
        {
            var empresa = new Empresa { Idempresa = 1, LoginIdlogin = 2 };
            var despesa = new Despesa { Iddespesa = 3 };
            _context.Empresas.Add(empresa);
            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(2, 2) } };
            var result = await _controller.FazerProposta(3, "desc", 100, DateTime.Now, DateTime.Now.AddDays(1));
            var created = result.Result as CreatedAtActionResult;
            created.Should().NotBeNull();
            ((Manutencao)created.Value).DescProposta.Should().Be("desc");
        }

        [Fact]
        public async Task FazerProposta_ReturnsUnauthorized_WhenTokenInvalid()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() } };
            var result = await _controller.FazerProposta(1, "desc", 1, DateTime.Now, DateTime.Now);
            (result.Result as UnauthorizedObjectResult).Should().NotBeNull();
        }

        [Fact]
        public async Task GetConcursosEmp_ReturnsForbid_WhenNotEmpresa()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 1) } };
            var result = await _controller.GetConcursosEmp();
            (result.Result as ForbidResult).Should().NotBeNull();
        }

        [Fact]
        public async Task GetEscolherP_ReturnsForbid_WhenNotAdmin()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 2) } };
            var result = await _controller.GetEscolherP(1);
            (result.Result as ForbidResult).Should().NotBeNull();
        }

        [Fact]
        public async Task AceitarProposta_ReturnsNotFound_WhenPropostaMissing()
        {
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(1, 3) } };
            var result = await _controller.AceitarProposta(999);
            (result as NotFoundResult).Should().NotBeNull();
        }

        [Fact]
        public async Task AceitarProposta_ValidProposal_UpdatesStateAndSendsEmail()
        {
            // Arrange
            var empresa = new Empresa { Idempresa = 1, LoginIdlogin = 2, FuncionarioEmpresa = "EmpresaX" };
            var login = new Login { Idlogin = 2, Email = "empresa@email.com" };
            var despesa = new Despesa { Iddespesa = 3, EstadoConcurso = "Aberto" };
            var veiculo = new Veiculo { Idveiculo = 10, EstadoVeiculo = "Disponivel" };
            despesa.VeiculoIdveiculo = veiculo.Idveiculo;
            var proposta = new Manutencao
            {
                Idmanutencao = 5,
                EmpresaIdempresa = empresa.Idempresa,
                DespesaIddespesa = despesa.Iddespesa,
                EstadoProposta = "Pendente",
                DescProposta = "Reparar motor",
                DespesaIddespesaNavigation = despesa
            };
            _context.Empresas.Add(empresa);
            _context.Logins.Add(login);
            _context.Despesas.Add(despesa);
            _context.Veiculos.Add(veiculo);
            _context.Manutencaos.Add(proposta);
            // Add another proposal to be rejected
            var outraProposta = new Manutencao { Idmanutencao = 6, EmpresaIdempresa = empresa.Idempresa, DespesaIddespesa = despesa.Iddespesa, EstadoProposta = "Pendente" };
            _context.Manutencaos.Add(outraProposta);
            await _context.SaveChangesAsync();
            _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = GetUser(2, 3) } };

            // Act
            var result = await _controller.AceitarProposta(5);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            (await _context.Manutencaos.FindAsync(5)).EstadoProposta.Should().Be("Aceite");
            (await _context.Manutencaos.FindAsync(6)).EstadoProposta.Should().Be("Rejeitada");
            (await _context.Despesas.FindAsync(3)).EstadoConcurso.Should().Be("Em Manutencao");
            _emailServiceMock.Verify(e => e.EnviarEmail(
                It.Is<string>(email => email == "empresa@email.com"),
                It.IsAny<string>(),
                It.IsAny<string>()), Times.Once);
        }
    }
}

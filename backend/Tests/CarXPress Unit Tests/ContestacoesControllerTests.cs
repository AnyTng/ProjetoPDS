using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using RESTful_API.Controllers;
using RESTful_API.Interface;
using RESTful_API.Models;
using System.Collections.Generic;
using System.Security.Claims;
using Xunit;

namespace Unit_Tests
{
    public class ContestacoesControllerTests
    {
        private readonly Mock<PdsContext> _mockContext;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly ContestacoesController _controller;

        public ContestacoesControllerTests()
        {
            _mockContext = new Mock<PdsContext>();
            _mockEmailService = new Mock<IEmailService>();
            _controller = new ContestacoesController(_mockContext.Object, _mockEmailService.Object);
        }

        private void SetUser(int userId, int roleId)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("roleId", roleId.ToString())
            }, "mock"));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task CriarContestacao_ReturnsUnauthorized_WhenTokenInvalid()
        {
            SetUser(0, 0); // Invalid token
            var result = await _controller.CriarContestacao("desc", 1);
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task CriarContestacao_ReturnsForbid_WhenNotCliente()
        {
            SetUser(1, 2); // Not a client
            var result = await _controller.CriarContestacao("desc", 1);
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsUnauthorized_WhenTokenInvalid()
        {
            SetUser(0, 0); // Invalid token
            var result = await _controller.AlterarContestacao(1, "Aceite");
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsForbid_WhenNotAdmin()
        {
            SetUser(1, 1); // Not an admin
            var result = await _controller.AlterarContestacao(1, "Aceite");
            Assert.IsType<ForbidResult>(result);
        }

        [Fact]
        public async Task AlterarContestacao_ReturnsBadRequest_WhenEstadoInvalid()
        {
            SetUser(1, 3); // Admin
            _mockContext.Setup(x => x.Contestacaos.FindAsync(1)).ReturnsAsync(new Contestacao());
            var result = await _controller.AlterarContestacao(1, "Outro");
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Estado da contestação inválido. Deve ser 'Aceite' ou 'Negada'.", badRequest.Value);
        }
    }
}


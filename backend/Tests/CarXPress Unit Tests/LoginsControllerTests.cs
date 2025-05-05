using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Controllers;
using RESTful_API.Models;
using FluentAssertions;
using Xunit;

namespace Unit_Tests
{
    public class LoginsControllerTests
    {
        private readonly DbContextOptions<PdsContext> _options;

        public LoginsControllerTests()
        {
            // Cada teste usa um nome único para a base In-Memory
            _options = new DbContextOptionsBuilder<PdsContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
        }

        private PdsContext GetInMemoryContext(bool seed = true)
        {
            var context = new PdsContext(_options);
            context.Database.EnsureCreated();

            if (seed && !context.Logins.Any())
            {
                context.Logins.AddRange(
                    new Login { Idlogin = 1, Email = "test1@example.com", HashPassword = "h1", TipoLoginIdtlogin = 1 },
                    new Login { Idlogin = 2, Email = "test2@example.com", HashPassword = "h2", TipoLoginIdtlogin = 2 }
                );
                context.SaveChanges();
            }

            return context;
        }

        [Fact]
        public async Task GetLogins_ReturnsAllLogins_InValue()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);

            // Act
            var actionResult = await controller.GetLogins();

            // Assert
            // Como GetLogins devolve lista em .Value e .Result fica null:
            actionResult.Result.Should().BeNull();
            actionResult.Value.Should().NotBeNull();

            var logins = actionResult.Value!;
            logins.Should().HaveCount(2);
            logins.Should().OnlyContain(l => l.Email.StartsWith("test"));
        }

        [Fact]
        public async Task GetLogin_WithExistingId_ReturnsLogin_InValue()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);
            var testId = 1;

            // Act
            var actionResult = await controller.GetLogin(testId);

            // Assert
            // Quando encontra, devolve objeto em .Value e .Result fica null:
            actionResult.Result.Should().BeNull();
            actionResult.Value.Should().NotBeNull();

            var login = actionResult.Value!;
            login.Idlogin.Should().Be(testId);
            login.Email.Should().Be("test1@example.com");
        }

        [Fact]
        public async Task GetLogin_WithNonExistingId_ReturnsNotFound()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);
            var testId = 99;

            // Act
            var actionResult = await controller.GetLogin(testId);

            // Assert
            // Como não existe, .Value fica null e .Result é NotFound()
            actionResult.Value.Should().BeNull();
            actionResult.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task PostLogin_CreatesNewLogin()
        {
            // Arrange
            await using var context = GetInMemoryContext(seed: false);
            var controller = new LoginsController(context);
            var newLogin = new Login
            {
                Email = "new@example.com",
                HashPassword = "npw",
                TipoLoginIdtlogin = 1
            };

            // Act
            var actionResult = await controller.PostLogin(newLogin);

            // Assert
            actionResult.Result.Should().BeOfType<CreatedAtActionResult>();
            var createdResult = (CreatedAtActionResult)actionResult.Result;
            createdResult.Value.Should().BeOfType<Login>();

            var created = (Login)createdResult.Value!;
            created.Email.Should().Be(newLogin.Email);

            // Confirma que foi guardado na base
            var inDb = await context.Logins.FindAsync(created.Idlogin);
            inDb.Should().NotBeNull();
            inDb!.Email.Should().Be(newLogin.Email);
        }

        [Fact]
        public async Task PutLogin_WithMatchingId_UpdatesLogin()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);
            var testId = 1;

            var updated = new Login
            {
                Idlogin = testId,
                Email = "upd@example.com",
                HashPassword = "hpw",
                TipoLoginIdtlogin = 1
            };

            // Act
            var result = await controller.PutLogin(testId, updated);

            // Assert
            result.Should().BeOfType<NoContentResult>();

            // Verifica na BD
            var inDb = await context.Logins.FindAsync(testId);
            inDb.Should().NotBeNull();
            inDb!.Email.Should().Be(updated.Email);
        }

        [Fact]
        public async Task PutLogin_WithMismatchingId_ReturnsBadRequest()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);

            // Act
            var result = await controller.PutLogin(1, new Login { Idlogin = 99 });

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task PutLogin_WithNonExistingId_ReturnsNotFound()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);

            // Act
            var result = await controller.PutLogin(99, new Login { Idlogin = 99 });

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteLogin_WithExistingId_RemovesLogin()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);

            // Act
            var result = await controller.DeleteLogin(1);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            (await context.Logins.FindAsync(1)).Should().BeNull();
        }

        [Fact]
        public async Task DeleteLogin_WithNonExistingId_ReturnsNotFound()
        {
            // Arrange
            await using var context = GetInMemoryContext();
            var controller = new LoginsController(context);

            // Act
            var result = await controller.DeleteLogin(99);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }
    }
}
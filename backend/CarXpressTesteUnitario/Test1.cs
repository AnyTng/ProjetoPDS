
using Microsoft.VisualStudio.Web.CodeGeneration.Design;
using Microsoft.VisualStudio.TestPlatform.TestHost;

using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;


namespace CarXpressTesteIntegracao
{
    [TestClass]
    public sealed class Test1
    {
        [TestMethod]
        public async Task Test_AtualizarPerfilCliente_ComDadosValidos_DeveRetornarNoContent()
        {
            // Arrange
            var factory = new WebApplicationFactory<Program>();
            var client = factory.CreateClient();

            // Simula o token de autenticação (em ambiente real, seria obtido via login)
            var tokenJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Im1hcmlhQG1hcmlhLm1hcmlhIiwibmFtZWlkIjoiMTAzMCIsInJvbGUiOiJjbGllbnRlIiwicm9sZUlkIjoiMSIsIm5iZiI6MTc0NjExMzQ4NiwiZXhwIjoxNzQ2MTQyMjg2LCJpYXQiOjE3NDYxMTM0ODZ9.BRAp-5pT85zVAbMXGVVkanb7FFKs97ToRAINo8SqAKE";
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenJwt);

            var clienteUpdateDto = new
            {
                NomeCliente = "João Atualizado",
                DataNascCliente = "1990-01-01",
                RuaCliente = "Rua Nova Atualizada",
                ContactoC1 = 912345678,
                ContactoC2 = 912345679,
                CodigoPostal = "4710001",
                Localidade = "p"
            };

            var jsonContent = new StringContent(JsonConvert.SerializeObject(clienteUpdateDto), Encoding.UTF8, "application/json");

            // Act
            var response = await client.PutAsync("api/clientes/me", jsonContent);

            // Assert
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}

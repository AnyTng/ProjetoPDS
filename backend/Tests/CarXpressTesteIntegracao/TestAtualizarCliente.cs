
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
    public sealed class TestAtualizarCliente
    {[TestMethod]
        public async Task Test_AtualizarPerfilCliente_ComDadosValidos_DeveRetornarNoContent()
        {
            // Arrange
            var factory = new WebApplicationFactory<Program>();
            var client = factory.CreateClient();

            var tokenJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImdvbmNhbG8udGllcnJpK2NsaWVudGVAZ21haWwuY29tIiwibmFtZWlkIjoiMyIsInJvbGUiOiJjbGllbnRlIiwicm9sZUlkIjoiMSIsIm5iZiI6MTc0NjQ4NDMzMCwiZXhwIjoxNzQ2NTEzMTMwLCJpYXQiOjE3NDY0ODQzMzB9.JK86QiaiUc7AY2zfH0HXKZQR4WJmavBVhA5qSI1J0vw"; // Token de teste
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenJwt);

            var form = new MultipartFormDataContent();
            form.Add(new StringContent("Gonçalo Tierri"), "NomeCliente");
            form.Add(new StringContent("2003-05-19T00:00:00"), "DataNascCliente");
            form.Add(new StringContent("Rua da Baixia"), "RuaCliente");
            form.Add(new StringContent("916345679"), "ContactoC1");
            form.Add(new StringContent("912345679"), "ContactoC2");
            form.Add(new StringContent("4710001"), "CodigoPostal");
            form.Add(new StringContent("p"), "Localidade");

            // Se quiseres testar com imagem (opcional)
            // var imagePath = "/caminho/para/imagem.jpg";
            // var imageBytes = File.ReadAllBytes(imagePath);
            // var fileContent = new ByteArrayContent(imageBytes);
            // fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            // form.Add(fileContent, "ImagemCliente", "imagem.jpg");

            // Act
            var response = await client.PutAsync("api/clientes/me", form);
            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine(responseBody);

            // Assert
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}

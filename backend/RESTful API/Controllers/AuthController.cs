using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System; // Adicionado para Exception e Console.WriteLine

using RESTful_API.Service;

namespace RESTful_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(PdsContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email e password são obrigatórios.");
            }

            // Inclui a navegação para TipoLogin para obter a descrição (opcional mas útil)
            var user = await _context.Logins
                                     .Include(l => l.TipoLoginIdtloginNavigation) // Inclui a relação
                                     .FirstOrDefaultAsync(u => u.Email == request.Username);

            if (user == null)
            {
                return Unauthorized("Email ou password inválidos.");
            }

            // Verifica a password
            bool isPasswordValid = false;
            try
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.HashPassword);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao verificar password para {request.Username}: {ex.Message}");
                return Unauthorized("Erro interno na autenticação.");
            }

            if (!isPasswordValid)
            {
                return Unauthorized("Email ou password inválidos.");
            }

            // --- Geração do Token ---
            var tokenHandler = new JwtSecurityTokenHandler();
            var secret = _configuration["JwtSettings:Secret"];
             if (string.IsNullOrEmpty(secret) || secret.Length < 32) {
                 Console.WriteLine("Erro Crítico: Chave secreta JWT inválida ou ausente.");
                 return StatusCode(500, "Erro interno de configuração.");
             }
            var key = Encoding.ASCII.GetBytes(secret);

            // ****** MAPEAMENTO CORRETO DE ID PARA ROLE NAME ******
            string roleName = user.TipoLoginIdtlogin switch
            {
                1 => "cliente", // ID 1 é Cliente
                2 => "empresa", // ID 2 é Empresa
                3 => "admin",   // ID 3 é Admin
                _ => "desconhecido"
            };

            if (roleName == "desconhecido") {
                Console.WriteLine($"Aviso: Role ID {user.TipoLoginIdtlogin} não mapeada para user {user.Email}.");
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Email),
                    new Claim(ClaimTypes.NameIdentifier, user.Idlogin.ToString()),
                    new Claim(ClaimTypes.Role, roleName), // Claim de Role standard com o NOME
                    new Claim("roleId", user.TipoLoginIdtlogin.ToString()) // Claim custom com o ID numérico
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new { token = jwt });
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Email e password são obrigatórios.");
            }
             // ****** VALIDAÇÃO CORRETA DOS IDs ******
            if (!new[] { 1, 2 }.Contains(request.TipoLoginIDTLogin)) // Verifica se o ID é 1, 2
            {
                return BadRequest("Tipo de utilizador inválido.");
            }
            if (!request.Username.Contains('@')) {
                return BadRequest("Formato de email inválido.");
            }

            if (await _context.Logins.AnyAsync(u => u.Email == request.Username))
            {
                return BadRequest(new { message = "Este email já se encontra registado." });
            }

            var tipoLoginExists = await _context.TipoLogins.AnyAsync(tl => tl.Idtlogin == request.TipoLoginIDTLogin);
             if (!tipoLoginExists)
             {

                 return BadRequest($"Tipo de login ID {request.TipoLoginIDTLogin} não existe na base de dados.");
             }

            string passwordHash;
            try {
                passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            } catch (Exception ex) {
                Console.WriteLine($"Erro ao gerar hash da password para {request.Username}: {ex.Message}");
                return StatusCode(500, "Erro interno ao processar o registo.");
            }

            var user = new Login
            {
                Email = request.Username,
                HashPassword = passwordHash,
                TipoLoginIdtlogin = request.TipoLoginIDTLogin // Guarda o ID (1, 2 ou 3)
            };

            _context.Logins.Add(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                 Console.WriteLine($"Erro DbUpdateException ao guardar novo login: {ex.InnerException?.Message ?? ex.Message}");
                 return StatusCode(500, "Erro ao guardar o novo utilizador. Tente novamente.");
            }

            return Ok(new { message = "Utilizador registado com sucesso." });
        }

        // --- Request Models ---
        public class RegisterRequest
        {
            public string Username { get; set; } // Email
            public string Password { get; set; }
            public int TipoLoginIDTLogin { get; set; } // 1=Cliente, 2=Empresa, 3=Admin
        }

        public class LoginRequest
        {
            public string Username { get; set; } // Email
            public string Password { get; set; }
        }
    }
}
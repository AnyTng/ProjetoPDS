using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;
using RESTful_API.Model;
using Microsoft.EntityFrameworkCore;

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
            var user = await _context.Logins.FirstOrDefaultAsync(u => u.Email == request.Username);

            if (user == null)
                return Unauthorized("Utilizador não encontrado");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.HashPassword))
                return Unauthorized("Password incorreta");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Idlogin.ToString()),
            new Claim("TipoLoginIDTLogin", user.TipoLoginIdtlogin.ToString())
        }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwt = tokenHandler.WriteToken(token);

            return Ok(new { token = jwt });
        }


        // ---------- REGISTER ----------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Logins.AnyAsync(u => u.Email == request.Username))
                return BadRequest("Username já existe");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new Login
            {
                Email = request.Username,
                HashPassword = passwordHash,
                TipoLoginIdtlogin = request.TipoLoginIDTLogin  // <-- necessário!
            };

            _context.Logins.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Utilizador registado com sucesso");
        }

        // ---------- REQUEST MODELS ----------
        public class RegisterRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public int TipoLoginIDTLogin { get; set; }
        }

        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }
    }
}

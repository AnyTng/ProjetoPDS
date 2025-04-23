// GeminiTakeThis/Backend/RESTful API/Controllers/ClientesController.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.RegularExpressions; // For Regex

namespace RESTful_API.Controllers
{
    // --- DTOs ---
    #region DTOs
    public class ClienteCreateDto
    {
        public string NomeCliente { get; set; }
        public DateTime? DataNascCliente { get; set; }
        public int NifCliente { get; set; }
        public string RuaCliente { get; set; }
        public string CodigoPostal { get; set; } // Ex: "1234-567" or "1234567"
        public string Localidade { get; set; } // Required if CP is new
        public int LoginIdlogin { get; set; }
        public int? ContactoC1 { get; set; }
        public int? ContactoC2 { get; set; }
    }

    // DTO for GET /me response
    public class ClienteResponseDto
    {
        public int Idcliente { get; set; }
        public string NomeCliente { get; set; }
        public DateTime? DataNascCliente { get; set; }
        public int? NifCliente { get; set; }
        public string RuaCliente { get; set; }
        public string CodigoPostal { get; set; }
        public string Localidade { get; set; }
        public string Email { get; set; }
        public int? ContactoC1 { get; set; }
        public int? ContactoC2 { get; set; }
        public bool? EstadoValCc { get; set; }
    }

    // DTO for PUT /me request body
    public class ClienteUpdateDto
    {
        public string NomeCliente { get; set; }
        public DateTime? DataNascCliente { get; set; }
        public string RuaCliente { get; set; }
        public string CodigoPostal { get; set; }
        public string Localidade { get; set; }
        public int? ContactoC1 { get; set; }
        public int? ContactoC2 { get; set; }
    }


    public class ClienteResponseDtoAdmin
    {
        public int Idcliente { get; set; }
        public string NomeCliente { get; set; }
        public DateTime? DataNascCliente { get; set; }
        public int? NifCliente { get; set; }
        public string RuaCliente { get; set; }
        public string CodigoPostal { get; set; }
        public string Localidade { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public int? ContactoC1 { get; set; }
        public int? ContactoC2 { get; set; }
        public bool? EstadoValCc { get; set; }
    }
    #endregion




    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ClientesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Clientes (Admin only - example)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteResponseDto>>> GetClientes()
        {
            return await _context.Clientes
                                 .Include(c => c.CodigoPostalCpNavigation)
                                 .Include(c => c.LoginIdloginNavigation)
                                 .Select(c => new ClienteResponseDto { /* Mapping */ })
                                 .ToListAsync();
        }

        // GET: api/clientes/me (For the logged-in user)
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<ClienteResponseDto>> GetMe()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Name);

            if (!int.TryParse(idLoginClaim, out int idLogin))
            {
                return Unauthorized("ID do login inválido no token.");
            }

            var cliente = await _context.Clientes
                                        .Include(c => c.CodigoPostalCpNavigation)
                                        .FirstOrDefaultAsync(c => c.LoginIdlogin == idLogin);

            if (cliente == null)
            {
                return NotFound("Perfil de cliente não encontrado para este login.");
            }

            string formattedCp = cliente.CodigoPostalCp.ToString("0000000");
            // formattedCp = $"{formattedCp.Substring(0, 4)}-{formattedCp.Substring(4, 3)}";

            var clienteResponse = new ClienteResponseDto
            {
                Idcliente = cliente.Idcliente,
                NomeCliente = cliente.NomeCliente,
                DataNascCliente = cliente.DataNascCliente,
                NifCliente = cliente.Nifcliente,
                RuaCliente = cliente.RuaCliente,
                CodigoPostal = formattedCp,
                Localidade = cliente.CodigoPostalCpNavigation?.Localidade,
                Email = email,
                ContactoC1 = cliente.ContactoC1,
                ContactoC2 = cliente.ContactoC2,
                EstadoValCc = cliente.EstadoValCc
            };

            return Ok(clienteResponse);
        }

        // GET: api/Clientes/5 (Admin only - example)
        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteResponseDto>> GetCliente(int id)
        {
             var cliente = await _context.Clientes
                                      .Include(c => c.CodigoPostalCpNavigation)
                                      .Include(c => c.LoginIdloginNavigation)
                                      .Where(c => c.Idcliente == id)
                                      .Select(c => new ClienteResponseDto { /* Mapping */ })
                                      .FirstOrDefaultAsync();

             if (cliente == null) return NotFound();
             return cliente;
        }


        [HttpGet("listAdmin")]
        public async Task<ActionResult<List<ClienteResponseDtoAdmin>>> GetClientesAdmin()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");

            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }


            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a administradores.");
            }

            var clientes = await _context.Clientes
                .Include(c => c.CodigoPostalCpNavigation)
                .Include(c => c.LoginIdloginNavigation)
                .Select(c => new ClienteResponseDtoAdmin
                {
                    Idcliente = c.Idcliente,
                    NomeCliente = c.NomeCliente,
                    DataNascCliente = c.DataNascCliente,
                    NifCliente = c.Nifcliente,
                    RuaCliente = c.RuaCliente,
                    CodigoPostal = c.CodigoPostalCpNavigation.Cp.ToString(),
                    Localidade = c.CodigoPostalCpNavigation.Localidade,
                    Email = c.LoginIdloginNavigation.Email,
                    Password = "********", // Password is not exposed
                    ContactoC1 = c.ContactoC1,
                    ContactoC2 = c.ContactoC2,
                    EstadoValCc = c.EstadoValCc
                })
                .ToListAsync();

            return clientes;
        }

        // *** NEW: PUT /api/clientes/me ***
        [HttpPut("me")]
        public async Task<IActionResult> PutMe(ClienteUpdateDto clienteUpdateDto)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idLoginClaim, out int userLoginId))
            {
                return Unauthorized("Token inválido ou ID do utilizador não encontrado.");
            }

            // Find the existing client record based on the Login ID from the token
            var clienteToUpdate = await _context.Clientes
                                                .Include(c => c.CodigoPostalCpNavigation)
                                                .FirstOrDefaultAsync(c => c.LoginIdlogin == userLoginId);

            if (clienteToUpdate == null)
            {
                return NotFound("Perfil de cliente não encontrado para atualizar.");
            }

            // --- Input Validation (same as before) ---
             if (string.IsNullOrWhiteSpace(clienteUpdateDto.NomeCliente)) return BadRequest("Nome do cliente não pode ser vazio.");
             if (clienteUpdateDto.ContactoC1.HasValue && clienteUpdateDto.ContactoC1.Value.ToString().Length != 9) return BadRequest("Contacto principal deve ter 9 dígitos.");
             if (clienteUpdateDto.ContactoC2.HasValue && clienteUpdateDto.ContactoC2.Value.ToString().Length != 9) return BadRequest("Contacto secundário deve ter 9 dígitos.");
             if (string.IsNullOrWhiteSpace(clienteUpdateDto.CodigoPostal)) return BadRequest("Código Postal é obrigatório.");
             string cpDigits = new string(clienteUpdateDto.CodigoPostal.Where(char.IsDigit).ToArray());
             if (cpDigits.Length != 7 || !int.TryParse(cpDigits, out int newCpNumeric)) return BadRequest("Formato inválido para Código Postal.");

            // --- Handle CodigoPostal Update (same as before) ---
            if (clienteToUpdate.CodigoPostalCp != newCpNumeric)
            {
                var newCodigoPostal = await _context.CodigoPostals.FindAsync(newCpNumeric);
                if (newCodigoPostal == null)
                {
                     if (string.IsNullOrWhiteSpace(clienteUpdateDto.Localidade)) return BadRequest($"Código Postal '{newCpNumeric}' não existe e a Localidade não foi fornecida.");
                     newCodigoPostal = new CodigoPostal { Cp = newCpNumeric, Localidade = clienteUpdateDto.Localidade };
                     _context.CodigoPostals.Add(newCodigoPostal);
                }
                 else if (!string.IsNullOrWhiteSpace(clienteUpdateDto.Localidade) && !newCodigoPostal.Localidade.Equals(clienteUpdateDto.Localidade, StringComparison.OrdinalIgnoreCase))
                 {
                     Console.WriteLine($"Aviso: Localidade fornecida '{clienteUpdateDto.Localidade}' difere da existente '{newCodigoPostal.Localidade}' para o CP {newCpNumeric}. Usando a existente.");
                     // Optionally update the existing CP's locality here if desired
                 }
                clienteToUpdate.CodigoPostalCp = newCpNumeric; // Update FK
            }

            // --- Update Allowed Fields (same as before) ---
            clienteToUpdate.NomeCliente = clienteUpdateDto.NomeCliente;
            clienteToUpdate.DataNascCliente = clienteUpdateDto.DataNascCliente;
            clienteToUpdate.RuaCliente = clienteUpdateDto.RuaCliente;
            clienteToUpdate.ContactoC1 = clienteUpdateDto.ContactoC1;
            clienteToUpdate.ContactoC2 = clienteUpdateDto.ContactoC2;

            _context.Entry(clienteToUpdate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                 // Check if the entity still exists based on the ID found earlier
                 if (!ClienteExists(clienteToUpdate.Idcliente)) // Use the client's actual ID
                 {
                      return NotFound("Cliente não encontrado durante a gravação (concorrência).");
                 }
                 else { throw; }
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException on PUT /me: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao guardar as alterações.");
            }

            return NoContent(); // Success
        }

        [HttpPut("EditeClienteAdmin")]
        public async Task<IActionResult> PutClienteAdmin(ClienteResponseDtoAdmin clienteAdmin)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");

            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }

            // Verifica se é admin (TipoLogin ID = 3)
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a administradores.");
            }

            var clienteToUpdate = await _context.Clientes
                                                .Include(c => c.LoginIdloginNavigation)
                                                .Include(c => c.CodigoPostalCpNavigation)
                                                .FirstOrDefaultAsync(c => c.Idcliente == clienteAdmin.Idcliente);


            if (clienteToUpdate == null)
            {
                return NotFound("Perfil de cliente não encontrado para atualizar.");
            }

            // --- Input Validation (same as before) ---
            if (string.IsNullOrWhiteSpace(clienteAdmin.NomeCliente)) return BadRequest("Nome do cliente não pode ser vazio.");
            if (clienteAdmin.ContactoC1.HasValue && clienteAdmin.ContactoC1.Value.ToString().Length != 9) return BadRequest("Contacto principal deve ter 9 dígitos.");
            //if (clienteAdmin.ContactoC2.HasValue && clienteAdmin.ContactoC2.Value.ToString().Length != 9) return BadRequest("Contacto secundário deve ter 9 dígitos.");
            if (string.IsNullOrWhiteSpace(clienteAdmin.CodigoPostal)) return BadRequest("Código Postal é obrigatório.");
            string cpDigits = new string(clienteAdmin.CodigoPostal.Where(char.IsDigit).ToArray());
            if (cpDigits.Length != 7 || !int.TryParse(cpDigits, out int newCpNumeric)) return BadRequest("Formato inválido para Código Postal.");

            // --- Handle CodigoPostal Update (same as before) ---
            if (clienteToUpdate.CodigoPostalCp != newCpNumeric)
            {
                var newCodigoPostal = await _context.CodigoPostals.FindAsync(newCpNumeric);
                if (newCodigoPostal == null)
                {
                    if (string.IsNullOrWhiteSpace(clienteAdmin.Localidade)) return BadRequest($"Código Postal '{newCpNumeric}' não existe e a Localidade não foi fornecida.");
                    newCodigoPostal = new CodigoPostal { Cp = newCpNumeric, Localidade = clienteAdmin.Localidade };
                    _context.CodigoPostals.Add(newCodigoPostal);
                }
                else if (!string.IsNullOrWhiteSpace(clienteAdmin.Localidade) && !newCodigoPostal.Localidade.Equals(clienteAdmin.Localidade, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine($"Aviso: Localidade fornecida '{clienteAdmin.Localidade}' difere da existente '{newCodigoPostal.Localidade}' para o CP {newCpNumeric}. Usando a existente.");
                    // Optionally update the existing CP's locality here if desired
                }
                clienteToUpdate.CodigoPostalCp = newCpNumeric; // Update FK
            }

            // --- Password to hash ---
            string passwordHash;
            try
            {
                passwordHash = BCrypt.Net.BCrypt.HashPassword(clienteAdmin.Password);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao gerar hash da password para {clienteAdmin.NomeCliente}: {ex.Message}");
                return StatusCode(500, "Erro interno ao processar o registo.");
            }

            // --- Update Allowed Fields (same as before) ---
            clienteToUpdate.NomeCliente = clienteAdmin.NomeCliente;
            clienteToUpdate.Nifcliente = clienteAdmin.NifCliente;
            clienteToUpdate.DataNascCliente = clienteAdmin.DataNascCliente;
            clienteToUpdate.RuaCliente = clienteAdmin.RuaCliente;
            clienteToUpdate.ContactoC1 = clienteAdmin.ContactoC1;
            clienteToUpdate.ContactoC2 = clienteAdmin.ContactoC2;
            clienteToUpdate.LoginIdloginNavigation.HashPassword = passwordHash;
            clienteToUpdate.LoginIdloginNavigation.Email = clienteAdmin.Email;
            clienteToUpdate.EstadoValCc = clienteAdmin.EstadoValCc;


            _context.Entry(clienteToUpdate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Check if the entity still exists based on the ID found earlier
                if (!ClienteExists(clienteToUpdate.Idcliente)) // Use the client's actual ID
                {
                    return NotFound("Cliente não encontrado durante a gravação (concorrência).");
                }
                else { throw; }
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException on PUT /me: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao guardar as alterações.");
            }

            return NoContent(); // Success
        }


        // POST: api/Clientes (Create new client - remains the same)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ClienteResponseDto>> PostCliente(ClienteCreateDto clienteDto)
        {
             // --- Validation (as before) ---
            if (string.IsNullOrWhiteSpace(clienteDto.NomeCliente)) return BadRequest("Nome é obrigatório.");
            // ... other validations ...
            string cpDigits = new string(clienteDto.CodigoPostal.Where(char.IsDigit).ToArray());
            if (cpDigits.Length != 7 || !int.TryParse(cpDigits, out int cpNumeric))
                return BadRequest("Formato inválido para Código Postal.");
             var loginExists = await _context.Logins.AnyAsync(l => l.Idlogin == clienteDto.LoginIdlogin);
             if (!loginExists) return BadRequest($"Login com ID {clienteDto.LoginIdlogin} não encontrado.");
             var existingCliente = await _context.Clientes.FirstOrDefaultAsync(c => c.LoginIdlogin == clienteDto.LoginIdlogin);
             if (existingCliente != null) return Conflict($"Já existe um perfil de cliente associado a este login.");

            // --- Handle CodigoPostal (as before) ---
            var codigoPostal = await _context.CodigoPostals.FindAsync(cpNumeric);
            if (codigoPostal == null)
            {
                 if (string.IsNullOrWhiteSpace(clienteDto.Localidade)) return BadRequest($"Código Postal '{cpNumeric}' não existe e a Localidade não foi fornecida.");
                 codigoPostal = new CodigoPostal { Cp = cpNumeric, Localidade = clienteDto.Localidade };
                 _context.CodigoPostals.Add(codigoPostal);
            }
             else if (!string.IsNullOrWhiteSpace(clienteDto.Localidade) && !codigoPostal.Localidade.Equals(clienteDto.Localidade, StringComparison.OrdinalIgnoreCase))
             {
                 Console.WriteLine($"Aviso: Localidade fornecida '{clienteDto.Localidade}' difere da existente '{codigoPostal.Localidade}' para o CP {cpNumeric}. Usando a existente.");
             }

            // --- Create Cliente Entity (as before) ---
            var cliente = new Cliente
            {
                NomeCliente = clienteDto.NomeCliente,
                DataNascCliente = clienteDto.DataNascCliente,
                Nifcliente = clienteDto.NifCliente,
                RuaCliente = clienteDto.RuaCliente,
                CodigoPostalCp = cpNumeric,
                LoginIdlogin = clienteDto.LoginIdlogin,
                ContactoC1 = clienteDto.ContactoC1,
                ContactoC2 = clienteDto.ContactoC2,
                EstadoValCc = false
            };
            _context.Clientes.Add(cliente);

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException ex)
            {
                 Console.WriteLine($"Erro ao guardar novo cliente: {ex.InnerException?.Message ?? ex.Message}");
                 if (_context.Entry(codigoPostal).State == EntityState.Added) _context.Entry(codigoPostal).State = EntityState.Detached;
                 return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno ao guardar o cliente.");
            }

             // --- Create Response DTO (as before) ---
            var createdClienteResponse = new ClienteResponseDto
            {
                Idcliente = cliente.Idcliente,
                NomeCliente = cliente.NomeCliente,
                // ... map other fields ...
                Email = (await _context.Logins.FindAsync(cliente.LoginIdlogin))?.Email, // Fetch email
                CodigoPostal = codigoPostal.Cp.ToString("0000000"),
                Localidade = codigoPostal.Localidade,
            };

            return CreatedAtAction(nameof(GetCliente), new { id = cliente.Idcliente }, createdClienteResponse);
        }



        // DELETE: api/Clientes/5 (Anonymizes Login, keeps Cliente record)
        [HttpDelete("{id}")]
        [Authorize]
        // Renomeado para clareza, mas a ROTA continua a ser DELETE /api/Clientes/{id}
        public async Task<IActionResult> DeleteClienteAndAnonymizeLogin(int id)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(idLoginClaim, out int userLoginId))
            {
                return Unauthorized("Token inválido.");
            }

            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound("Cliente não encontrado.");
            }

            // Authorization Check: Allow self-delete or admin delete
            if (cliente.LoginIdlogin != userLoginId && !User.IsInRole("admin"))
            {
                return Forbid("Não tem permissão para executar esta ação neste perfil.");
            }

            // Find the associated login record
            var loginToAnonymize = await _context.Logins.FindAsync(cliente.LoginIdlogin);

            if (loginToAnonymize != null)
            {
                // Anonymize the login details
                loginToAnonymize.Email = null;
                loginToAnonymize.HashPassword = null;

                _context.Entry(loginToAnonymize).State = EntityState.Modified;
                Console.WriteLine($"Login {loginToAnonymize.Idlogin} (Cliente {id}) marcado para anonimização.");
            }
            else
            {
                Console.WriteLine($"Aviso: Login {cliente.LoginIdlogin} (Cliente {id}) não encontrado para anonimização.");
            }

            // --- NÃO REMOVER O CLIENTE ---
            // _context.Clientes.Remove(cliente); // <<--- ESTA LINHA NÃO DEVE EXISTIR AQUI

            try
            {
                await _context.SaveChangesAsync(); // Salva as alterações no Login
                Console.WriteLine($"Alterações guardadas. Login {loginToAnonymize?.Idlogin} anonimizado.");
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro DbUpdateException ao anonimizar login para Cliente {id}: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao processar a desativação da conta.");
            }

            return NoContent(); // Sucesso
        }
        private bool ClienteExists(int id)
        {
            return _context.Clientes.Any(e => e.Idcliente == id);
        }
    }
}
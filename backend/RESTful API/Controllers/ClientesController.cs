
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;
using Microsoft.AspNetCore.Authorization; // Adicionar para [Authorize] se necessário
using System.Security.Claims;



namespace RESTful_API.Controllers
{
    // DTO para a criação de Cliente
    public class ClienteCreateDto
    {
        public string NomeCliente { get; set; }
        public DateTime? DataNascCliente { get; set; }
        public int NifCliente { get; set; }
        public string RuaCliente { get; set; }
        // Receber o código postal como string para validação e separação
        public string CodigoPostal { get; set; } // Ex: "1234-567" ou "1234567"
        public string Localidade { get; set; } // Adicionar localidade
        public int LoginIdlogin { get; set; }
        public int? ContactoC1 { get; set; }
        public int? ContactoC2 { get; set; }
        // Remover EstadoValCc daqui, definir por defeito ou noutra lógica
    }


    [Route("api/[controller]")]
    [ApiController]
    public class ClientesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ClientesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Clientes
        [HttpGet]
        //[Authorize(Roles = "Admin")] // Proteger se necessário
        public async Task<ActionResult<IEnumerable<Cliente>>> GetClientes()
        {
            return await _context.Clientes
                                 .Include(c => c.CodigoPostalCpNavigation) // Incluir localidade
                                 .ToListAsync();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<Cliente>> GetMe()
        {
            var idLoginClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idLoginClaim, out int idLogin))
                return Unauthorized("ID do login inválido no token");

            var cliente = await _context.Clientes
                                .Include(c => c.CodigoPostalCpNavigation)
                                .FirstOrDefaultAsync(c => c.LoginIdlogin == idLogin);

            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }



        // GET: api/Clientes/5
        [HttpGet("{id}")]
        //[Authorize(Roles = "Admin")] // Proteger se necessário
        public async Task<ActionResult<Cliente>> GetCliente(int id)
        {
            var cliente = await _context.Clientes
                                      .Include(c => c.CodigoPostalCpNavigation)
                                      .FirstOrDefaultAsync(c => c.Idcliente == id);


            if (cliente == null)
            {
                return NotFound();
            }

            return cliente;
        }

        // PUT: api/Clientes/5
        [HttpPut("{id}")]
        //[Authorize(Roles = "Admin,Cliente")] // Permitir que o próprio cliente ou admin edite
        public async Task<IActionResult> PutCliente(int id, Cliente cliente) // Poderia usar um DTO aqui também
        {
            // Adicionar verificação de permissão (cliente só pode editar o seu próprio perfil)
            // Ex: if (User.FindFirstValue(ClaimTypes.NameIdentifier) != cliente.LoginIdlogin.ToString() && !User.IsInRole("Admin")) return Forbid();

            if (id != cliente.Idcliente)
            {
                return BadRequest();
            }

            // Validar CodigoPostalCp - garantir que existe antes de atualizar
            var codigoPostalExists = await _context.CodigoPostals.AnyAsync(cp => cp.Cp == cliente.CodigoPostalCp);
            if (!codigoPostalExists)
            {
                // Considerar criar o CP aqui se fizer sentido, ou retornar erro
                return BadRequest($"Código Postal '{cliente.CodigoPostalCp}' não encontrado.");
            }


            _context.Entry(cliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClienteExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                // Logar o erro exato para depuração
                Console.WriteLine($"DbUpdateException: {ex.InnerException?.Message ?? ex.Message}");
                return StatusCode(500, "Erro ao guardar alterações na base de dados.");
            }


            return NoContent();
        }

        // POST: api/Clientes
        [HttpPost]
        //[Authorize] // Requer autenticação para criar um cliente associado ao login
        public async Task<ActionResult<Cliente>> PostCliente(ClienteCreateDto clienteDto)
        {
             // --- Validação do Código Postal ---
            if (string.IsNullOrWhiteSpace(clienteDto.CodigoPostal))
            {
                return BadRequest("Código Postal é obrigatório.");
            }

            string cpDigits = new string(clienteDto.CodigoPostal.Where(char.IsDigit).ToArray());
            if (cpDigits.Length != 7 || !int.TryParse(cpDigits, out int cpNumeric))
            {
                 return BadRequest("Formato inválido para Código Postal (deve ter 7 dígitos).");
            }

             // Verificar NIF (exemplo básico)
            if (clienteDto.NifCliente.ToString().Length != 9)
            {
                return BadRequest("NIF deve ter 9 dígitos.");
            }

            // Verificar ContactoC1 (exemplo básico)
             if (clienteDto.ContactoC1.HasValue && clienteDto.ContactoC1.Value.ToString().Length != 9)
            {
                 return BadRequest("Contacto principal deve ter 9 dígitos.");
            }

            // --- Gestão do Código Postal ---
            var codigoPostal = await _context.CodigoPostals.FindAsync(cpNumeric);
            if (codigoPostal == null)
            {
                // Se não existe, cria um novo
                if (string.IsNullOrWhiteSpace(clienteDto.Localidade))
                {
                    // Tentar buscar localidade ou retornar erro se não for fornecida e for necessária
                    // Poderia ter uma API externa ou tabela pré-populada aqui
                     return BadRequest("Localidade é obrigatória para um novo Código Postal.");
                }
                codigoPostal = new CodigoPostal { Cp = cpNumeric, Localidade = clienteDto.Localidade };
                _context.CodigoPostals.Add(codigoPostal);
                // Não faz SaveChanges aqui, fará junto com o Cliente
            }
             else if (!string.IsNullOrWhiteSpace(clienteDto.Localidade) &&
                     !codigoPostal.Localidade.Equals(clienteDto.Localidade, StringComparison.OrdinalIgnoreCase))
             {
                 // Opcional: Atualizar localidade se fornecida e diferente da existente
                 // codigoPostal.Localidade = clienteDto.Localidade;
                 // _context.Entry(codigoPostal).State = EntityState.Modified;
                 Console.WriteLine($"Aviso: Localidade fornecida '{clienteDto.Localidade}' difere da existente '{codigoPostal.Localidade}' para o CP {cpNumeric}. A existente será mantida.");
             }


             // --- Criação do Cliente ---
            var cliente = new Cliente
            {
                NomeCliente = clienteDto.NomeCliente,
                DataNascCliente = clienteDto.DataNascCliente,
                Nifcliente = clienteDto.NifCliente,
                RuaCliente = clienteDto.RuaCliente,
                CodigoPostalCp = cpNumeric, // Usa o CP numérico validado/criado
                LoginIdlogin = clienteDto.LoginIdlogin,
                ContactoC1 = clienteDto.ContactoC1,
                ContactoC2 = clienteDto.ContactoC2,
                EstadoValCc = false // Definir como falso por defeito
            };

            _context.Clientes.Add(cliente);

            try
            {
                await _context.SaveChangesAsync(); // Salva Cliente e CodigoPostal (se for novo)
            }
            catch (DbUpdateException ex)
            {
                 // Log detalhado do erro
                Console.WriteLine($"Erro ao guardar cliente: {ex.InnerException?.Message ?? ex.Message}");
                // Tentar remover o CodigoPostal se foi adicionado nesta transação e falhou
                if (_context.Entry(codigoPostal).State == EntityState.Added)
                {
                    _context.Entry(codigoPostal).State = EntityState.Detached;
                }
                 return StatusCode(500, "Erro interno ao guardar o cliente na base de dados.");
            }


            // Retorna o cliente completo criado (incluindo o ID gerado)
            // É preciso re-ler ou carregar a navegação se quiser retornar a localidade
            await _context.Entry(cliente).Reference(c => c.CodigoPostalCpNavigation).LoadAsync();

            return CreatedAtAction(nameof(GetCliente), new { id = cliente.Idcliente }, cliente);
        }


        // DELETE: api/Clientes/5
        [HttpDelete("{id}")]
        //[Authorize(Roles = "Admin")] // Apenas Admin pode apagar clientes diretamente?
        public async Task<IActionResult> DeleteCliente(int id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
            {
                return NotFound();
            }

             // Considerar lógica adicional: apagar Login associado? Anular alugueres?
            // Por agora, apenas apaga o cliente. O Login pode ficar órfão.

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClienteExists(int id)
        {
            return _context.Clientes.Any(e => e.Idcliente == id);
        }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    //dto
    public class EmpresaDTO
    {
        public string? FuncionarioEmpresa { get; set; }
        public string? NomeEmpresa { get; set; }

        public int? NifEmpresa { get; set; }

        public string? RuaEmpresa { get; set; }

        //public int? CodigoPostalCp { get; set; }
        public string CodigoPostal { get; set; }

        public int LoginIdlogin { get; set; }

        public int? ContactoE1 { get; set; }

        public int? ContactoE2 { get; set; }
    }



    [Route("api/[controller]")]
    [ApiController]
    public class EmpresasController : ControllerBase
    {
        private readonly PdsContext _context;

        public EmpresasController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Empresas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Empresa>>> GetEmpresas()
        {
            return await _context.Empresas.ToListAsync();
        }

        // GET: api/Empresas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Empresa>> GetEmpresa(int id)
        {
            var empresa = await _context.Empresas.FindAsync(id);

            if (empresa == null)
            {
                return NotFound();
            }

            return empresa;
        }

        // PUT: api/Empresas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmpresa(int id, Empresa empresa)
        {
            if (id != empresa.Idempresa)
            {
                return BadRequest();
            }

            _context.Entry(empresa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmpresaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Empresas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Empresa>> PostEmpresa(EmpresaDTO empresaDTO)
        {
            if (string.IsNullOrWhiteSpace(empresaDTO.FuncionarioEmpresa)) return BadRequest("Nome do representante é obrigatório.");
            if (string.IsNullOrWhiteSpace(empresaDTO.NomeEmpresa)) return BadRequest("Nome da empresa é obrigatório.");
            string cpDigits = new string(empresaDTO.CodigoPostal.Where(char.IsDigit).ToArray());
            if (cpDigits.Length != 7 || !int.TryParse(cpDigits, out int cpNumeric))
                return BadRequest("Formato inválido para Código Postal.");

            var loginExists = await _context.Logins.AnyAsync(l => l.Idlogin == empresaDTO.LoginIdlogin);
            if (!loginExists) return BadRequest($"Login com ID {empresaDTO.LoginIdlogin} não encontrado.");
            var existingEmpresa = await _context.Empresas.FirstOrDefaultAsync(c => c.LoginIdlogin == empresaDTO.LoginIdlogin);
            if (existingEmpresa != null) return Conflict($"Já existe um perfil de Empresa associado a este login.");


            var codigoPostal = await _context.CodigoPostals.FindAsync(cpNumeric);
            if(codigoPostal==null) return BadRequest("Código Postal não existe.");
            
            var empresa = new Empresa
            {
                FuncionarioEmpresa = empresaDTO.FuncionarioEmpresa,
                NomeEmpresa = empresaDTO.NomeEmpresa,
                NifEmpresa = empresaDTO.NifEmpresa,
                RuaEmpresa = empresaDTO.RuaEmpresa,
                CodigoPostalCp = cpNumeric,
                LoginIdlogin = empresaDTO.LoginIdlogin,
                ContactoE1 = empresaDTO.ContactoE1,
                ContactoE2 = empresaDTO.ContactoE2
            };
            _context.Empresas.Add(empresa);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro ao guardar nova empresa: {ex.InnerException?.Message ?? ex.Message}");
                if (_context.Entry(empresa).State == EntityState.Added) _context.Entry(empresa).State = EntityState.Detached;
                return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno ao guardar a empresa.");
            }
            // --- Create Response DTO (as before) ---
            var createdEmpresaResponse = new Empresa
            {
                Idempresa = empresa.Idempresa,
                FuncionarioEmpresa = empresa.FuncionarioEmpresa,
                NomeEmpresa = empresa.NomeEmpresa,
                NifEmpresa = empresa.NifEmpresa,
                RuaEmpresa = empresa.RuaEmpresa,
                CodigoPostalCp = empresa.CodigoPostalCp,
                LoginIdlogin = empresa.LoginIdlogin,
                ContactoE1 = empresa.ContactoE1,
                ContactoE2 = empresa.ContactoE2
            };
            return CreatedAtAction(nameof(GetEmpresa), new { id = empresa.Idempresa }, createdEmpresaResponse);

        }

        // DELETE: api/Empresas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmpresa(int id)
        {
            var empresa = await _context.Empresas.FindAsync(id);
            if (empresa == null)
            {
                return NotFound();
            }

            _context.Empresas.Remove(empresa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EmpresaExists(int id)
        {
            return _context.Empresas.Any(e => e.Idempresa == id);
        }


        
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Model;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HabilitacaoClientesController : ControllerBase
    {
        private readonly PdsContext _context;

        public HabilitacaoClientesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/HabilitacaoClientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<HabilitacaoCliente>>> GetHabilitacaoClientes()
        {
            return await _context.HabilitacaoClientes.ToListAsync();
        }

        // GET: api/HabilitacaoClientes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HabilitacaoCliente>> GetHabilitacaoCliente(int id)
        {
            var habilitacaoCliente = await _context.HabilitacaoClientes.FindAsync(id);

            if (habilitacaoCliente == null)
            {
                return NotFound();
            }

            return habilitacaoCliente;
        }

        // PUT: api/HabilitacaoClientes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutHabilitacaoCliente(int id, HabilitacaoCliente habilitacaoCliente)
        {
            if (id != habilitacaoCliente.ClienteIdcliente)
            {
                return BadRequest();
            }

            _context.Entry(habilitacaoCliente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HabilitacaoClienteExists(id))
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

        // POST: api/HabilitacaoClientes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<HabilitacaoCliente>> PostHabilitacaoCliente(HabilitacaoCliente habilitacaoCliente)
        {
            _context.HabilitacaoClientes.Add(habilitacaoCliente);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (HabilitacaoClienteExists(habilitacaoCliente.ClienteIdcliente))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetHabilitacaoCliente", new { id = habilitacaoCliente.ClienteIdcliente }, habilitacaoCliente);
        }

        // DELETE: api/HabilitacaoClientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHabilitacaoCliente(int id)
        {
            var habilitacaoCliente = await _context.HabilitacaoClientes.FindAsync(id);
            if (habilitacaoCliente == null)
            {
                return NotFound();
            }

            _context.HabilitacaoClientes.Remove(habilitacaoCliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HabilitacaoClienteExists(int id)
        {
            return _context.HabilitacaoClientes.Any(e => e.ClienteIdcliente == id);
        }
    }
}

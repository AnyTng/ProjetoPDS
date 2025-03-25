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
    public class EstadoVeiculoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public EstadoVeiculoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/EstadoVeiculoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoVeiculo>>> GetEstadoVeiculos()
        {
            return await _context.EstadoVeiculos.ToListAsync();
        }

        // GET: api/EstadoVeiculoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EstadoVeiculo>> GetEstadoVeiculo(int id)
        {
            var estadoVeiculo = await _context.EstadoVeiculos.FindAsync(id);

            if (estadoVeiculo == null)
            {
                return NotFound();
            }

            return estadoVeiculo;
        }

        // PUT: api/EstadoVeiculoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEstadoVeiculo(int id, EstadoVeiculo estadoVeiculo)
        {
            if (id != estadoVeiculo.IdestadoVeiculo)
            {
                return BadRequest();
            }

            _context.Entry(estadoVeiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EstadoVeiculoExists(id))
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

        // POST: api/EstadoVeiculoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EstadoVeiculo>> PostEstadoVeiculo(EstadoVeiculo estadoVeiculo)
        {
            _context.EstadoVeiculos.Add(estadoVeiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEstadoVeiculo", new { id = estadoVeiculo.IdestadoVeiculo }, estadoVeiculo);
        }

        // DELETE: api/EstadoVeiculoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstadoVeiculo(int id)
        {
            var estadoVeiculo = await _context.EstadoVeiculos.FindAsync(id);
            if (estadoVeiculo == null)
            {
                return NotFound();
            }

            _context.EstadoVeiculos.Remove(estadoVeiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EstadoVeiculoExists(int id)
        {
            return _context.EstadoVeiculos.Any(e => e.IdestadoVeiculo == id);
        }
    }
}

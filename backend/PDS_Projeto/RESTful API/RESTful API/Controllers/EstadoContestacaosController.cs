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
    public class EstadoContestacaosController : ControllerBase
    {
        private readonly PdsContext _context;

        public EstadoContestacaosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/EstadoContestacaos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoContestacao>>> GetEstadoContestacaos()
        {
            return await _context.EstadoContestacaos.ToListAsync();
        }

        // GET: api/EstadoContestacaos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EstadoContestacao>> GetEstadoContestacao(int id)
        {
            var estadoContestacao = await _context.EstadoContestacaos.FindAsync(id);

            if (estadoContestacao == null)
            {
                return NotFound();
            }

            return estadoContestacao;
        }

        // PUT: api/EstadoContestacaos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEstadoContestacao(int id, EstadoContestacao estadoContestacao)
        {
            if (id != estadoContestacao.IdestadoC)
            {
                return BadRequest();
            }

            _context.Entry(estadoContestacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EstadoContestacaoExists(id))
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

        // POST: api/EstadoContestacaos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<EstadoContestacao>> PostEstadoContestacao(EstadoContestacao estadoContestacao)
        {
            _context.EstadoContestacaos.Add(estadoContestacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetEstadoContestacao", new { id = estadoContestacao.IdestadoC }, estadoContestacao);
        }

        // DELETE: api/EstadoContestacaos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEstadoContestacao(int id)
        {
            var estadoContestacao = await _context.EstadoContestacaos.FindAsync(id);
            if (estadoContestacao == null)
            {
                return NotFound();
            }

            _context.EstadoContestacaos.Remove(estadoContestacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EstadoContestacaoExists(int id)
        {
            return _context.EstadoContestacaos.Any(e => e.IdestadoC == id);
        }
    }
}

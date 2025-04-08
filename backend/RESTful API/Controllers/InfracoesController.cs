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
    [Route("api/[controller]")]
    [ApiController]
    public class InfracoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public InfracoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Infracoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Infracao>>> GetInfracoes()
        {
            return await _context.Infracoes.ToListAsync();
        }

        // GET: api/Infracoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Infracao>> GetInfracao(int id)
        {
            var infracao = await _context.Infracoes.FindAsync(id);

            if (infracao == null)
            {
                return NotFound();
            }

            return infracao;
        }

        // PUT: api/Infracoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInfracao(int id, Infracao infracao)
        {
            if (id != infracao.Idinfracao)
            {
                return BadRequest();
            }

            _context.Entry(infracao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InfracaoExists(id))
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

        // POST: api/Infracoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Infracao>> PostInfracao(Infracao infracao)
        {
            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInfracao", new { id = infracao.Idinfracao }, infracao);
        }

        // DELETE: api/Infracoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfracao(int id)
        {
            var infracao = await _context.Infracoes.FindAsync(id);
            if (infracao == null)
            {
                return NotFound();
            }

            _context.Infracoes.Remove(infracao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InfracaoExists(int id)
        {
            return _context.Infracoes.Any(e => e.Idinfracao == id);
        }
    }
}

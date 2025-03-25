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
    public class ContestacaosController : ControllerBase
    {
        private readonly PdsContext _context;

        public ContestacaosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Contestacaos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contestacao>>> GetContestacaos()
        {
            return await _context.Contestacaos.ToListAsync();
        }

        // GET: api/Contestacaos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contestacao>> GetContestacao(int id)
        {
            var contestacao = await _context.Contestacaos.FindAsync(id);

            if (contestacao == null)
            {
                return NotFound();
            }

            return contestacao;
        }

        // PUT: api/Contestacaos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContestacao(int id, Contestacao contestacao)
        {
            if (id != contestacao.InfracoesIdinfracao)
            {
                return BadRequest();
            }

            _context.Entry(contestacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContestacaoExists(id))
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

        // POST: api/Contestacaos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Contestacao>> PostContestacao(Contestacao contestacao)
        {
            _context.Contestacaos.Add(contestacao);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ContestacaoExists(contestacao.InfracoesIdinfracao))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetContestacao", new { id = contestacao.InfracoesIdinfracao }, contestacao);
        }

        // DELETE: api/Contestacaos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContestacao(int id)
        {
            var contestacao = await _context.Contestacaos.FindAsync(id);
            if (contestacao == null)
            {
                return NotFound();
            }

            _context.Contestacaos.Remove(contestacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContestacaoExists(int id)
        {
            return _context.Contestacaos.Any(e => e.InfracoesIdinfracao == id);
        }
    }
}

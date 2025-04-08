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
    public class ContestacoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ContestacoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Contestacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contestacao>>> GetContestacaos()
        {
            return await _context.Contestacaos.ToListAsync();
        }

        // GET: api/Contestacoes/5
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

        // PUT: api/Contestacoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContestacao(int id, Contestacao contestacao)
        {
            if (id != contestacao.Idcontestacao)
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

        // POST: api/Contestacoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Contestacao>> PostContestacao(Contestacao contestacao)
        {
            _context.Contestacaos.Add(contestacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContestacao", new { id = contestacao.Idcontestacao }, contestacao);
        }

        // DELETE: api/Contestacoes/5
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
            return _context.Contestacaos.Any(e => e.Idcontestacao == id);
        }
    }
}

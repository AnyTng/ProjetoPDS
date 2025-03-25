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
    public class TipoInfracaosController : ControllerBase
    {
        private readonly PdsContext _context;

        public TipoInfracaosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/TipoInfracaos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoInfracao>>> GetTipoInfracaos()
        {
            return await _context.TipoInfracaos.ToListAsync();
        }

        // GET: api/TipoInfracaos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoInfracao>> GetTipoInfracao(int id)
        {
            var tipoInfracao = await _context.TipoInfracaos.FindAsync(id);

            if (tipoInfracao == null)
            {
                return NotFound();
            }

            return tipoInfracao;
        }

        // PUT: api/TipoInfracaos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoInfracao(int id, TipoInfracao tipoInfracao)
        {
            if (id != tipoInfracao.Idtinfracao)
            {
                return BadRequest();
            }

            _context.Entry(tipoInfracao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoInfracaoExists(id))
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

        // POST: api/TipoInfracaos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoInfracao>> PostTipoInfracao(TipoInfracao tipoInfracao)
        {
            _context.TipoInfracaos.Add(tipoInfracao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoInfracao", new { id = tipoInfracao.Idtinfracao }, tipoInfracao);
        }

        // DELETE: api/TipoInfracaos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoInfracao(int id)
        {
            var tipoInfracao = await _context.TipoInfracaos.FindAsync(id);
            if (tipoInfracao == null)
            {
                return NotFound();
            }

            _context.TipoInfracaos.Remove(tipoInfracao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoInfracaoExists(int id)
        {
            return _context.TipoInfracaos.Any(e => e.Idtinfracao == id);
        }
    }
}

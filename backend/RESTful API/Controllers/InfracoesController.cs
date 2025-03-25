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
    public class InfracoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public InfracoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Infracoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Infraco>>> GetInfracoes()
        {
            return await _context.Infracoes.ToListAsync();
        }

        // GET: api/Infracoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Infraco>> GetInfraco(int id)
        {
            var infraco = await _context.Infracoes.FindAsync(id);

            if (infraco == null)
            {
                return NotFound();
            }

            return infraco;
        }

        // PUT: api/Infracoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInfraco(int id, Infraco infraco)
        {
            if (id != infraco.Idinfracao)
            {
                return BadRequest();
            }

            _context.Entry(infraco).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InfracoExists(id))
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
        public async Task<ActionResult<Infraco>> PostInfraco(Infraco infraco)
        {
            _context.Infracoes.Add(infraco);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInfraco", new { id = infraco.Idinfracao }, infraco);
        }

        // DELETE: api/Infracoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfraco(int id)
        {
            var infraco = await _context.Infracoes.FindAsync(id);
            if (infraco == null)
            {
                return NotFound();
            }

            _context.Infracoes.Remove(infraco);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InfracoExists(int id)
        {
            return _context.Infracoes.Any(e => e.Idinfracao == id);
        }
    }
}

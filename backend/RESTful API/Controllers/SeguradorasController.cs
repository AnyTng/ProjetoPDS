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
    public class SeguradorasController : ControllerBase
    {
        private readonly PdsContext _context;

        public SeguradorasController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Seguradoras
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Seguradora>>> GetSeguradoras()
        {
            return await _context.Seguradoras.ToListAsync();
        }

        // GET: api/Seguradoras/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Seguradora>> GetSeguradora(int id)
        {
            var seguradora = await _context.Seguradoras.FindAsync(id);

            if (seguradora == null)
            {
                return NotFound();
            }

            return seguradora;
        }

        // PUT: api/Seguradoras/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSeguradora(int id, Seguradora seguradora)
        {
            if (id != seguradora.Idseguradora)
            {
                return BadRequest();
            }

            _context.Entry(seguradora).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeguradoraExists(id))
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

        // POST: api/Seguradoras
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Seguradora>> PostSeguradora(Seguradora seguradora)
        {
            _context.Seguradoras.Add(seguradora);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSeguradora", new { id = seguradora.Idseguradora }, seguradora);
        }

        // DELETE: api/Seguradoras/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeguradora(int id)
        {
            var seguradora = await _context.Seguradoras.FindAsync(id);
            if (seguradora == null)
            {
                return NotFound();
            }

            _context.Seguradoras.Remove(seguradora);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SeguradoraExists(int id)
        {
            return _context.Seguradoras.Any(e => e.Idseguradora == id);
        }
    }
}

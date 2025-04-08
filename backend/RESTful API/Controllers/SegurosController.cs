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
    public class SegurosController : ControllerBase
    {
        private readonly PdsContext _context;

        public SegurosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Seguros
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Seguro>>> GetSeguros()
        {
            return await _context.Seguros.ToListAsync();
        }

        // GET: api/Seguros/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Seguro>> GetSeguro(string id)
        {
            var seguro = await _context.Seguros.FindAsync(id);

            if (seguro == null)
            {
                return NotFound();
            }

            return seguro;
        }

        // PUT: api/Seguros/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSeguro(string id, Seguro seguro)
        {
            if (id != seguro.ApoliceSeguro)
            {
                return BadRequest();
            }

            _context.Entry(seguro).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeguroExists(id))
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

        // POST: api/Seguros
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Seguro>> PostSeguro(Seguro seguro)
        {
            _context.Seguros.Add(seguro);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (SeguroExists(seguro.ApoliceSeguro))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetSeguro", new { id = seguro.ApoliceSeguro }, seguro);
        }

        // DELETE: api/Seguros/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeguro(string id)
        {
            var seguro = await _context.Seguros.FindAsync(id);
            if (seguro == null)
            {
                return NotFound();
            }

            _context.Seguros.Remove(seguro);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SeguroExists(string id)
        {
            return _context.Seguros.Any(e => e.ApoliceSeguro == id);
        }
    }
}

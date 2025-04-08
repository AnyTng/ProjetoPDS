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
    public class AlugueresController : ControllerBase
    {
        private readonly PdsContext _context;

        public AlugueresController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Alugueres
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluguer>>> GetAluguers()
        {
            return await _context.Aluguers.ToListAsync();
        }

        // GET: api/Alugueres/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Aluguer>> GetAluguer(int id)
        {
            var aluguer = await _context.Aluguers.FindAsync(id);

            if (aluguer == null)
            {
                return NotFound();
            }

            return aluguer;
        }

        // PUT: api/Alugueres/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluguer(int id, Aluguer aluguer)
        {
            if (id != aluguer.Idaluguer)
            {
                return BadRequest();
            }

            _context.Entry(aluguer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AluguerExists(id))
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

        // POST: api/Alugueres
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Aluguer>> PostAluguer(Aluguer aluguer)
        {
            _context.Aluguers.Add(aluguer);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAluguer", new { id = aluguer.Idaluguer }, aluguer);
        }

        // DELETE: api/Alugueres/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluguer(int id)
        {
            var aluguer = await _context.Aluguers.FindAsync(id);
            if (aluguer == null)
            {
                return NotFound();
            }

            _context.Aluguers.Remove(aluguer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AluguerExists(int id)
        {
            return _context.Aluguers.Any(e => e.Idaluguer == id);
        }
    }
}

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
    public class CodigoPostalsController : ControllerBase
    {
        private readonly PdsContext _context;

        public CodigoPostalsController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/CodigoPostals
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CodigoPostal>>> GetCodigoPostals()
        {
            return await _context.CodigoPostals.ToListAsync();
        }

        // GET: api/CodigoPostals/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CodigoPostal>> GetCodigoPostal(int id)
        {
            var codigoPostal = await _context.CodigoPostals.FindAsync(id);

            if (codigoPostal == null)
            {
                return NotFound();
            }

            return codigoPostal;
        }

        // PUT: api/CodigoPostals/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCodigoPostal(int id, CodigoPostal codigoPostal)
        {
            if (id != codigoPostal.Cp)
            {
                return BadRequest();
            }

            _context.Entry(codigoPostal).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CodigoPostalExists(id))
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

        // POST: api/CodigoPostals
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<CodigoPostal>> PostCodigoPostal(CodigoPostal codigoPostal)
        {
            _context.CodigoPostals.Add(codigoPostal);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CodigoPostalExists(codigoPostal.Cp))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetCodigoPostal", new { id = codigoPostal.Cp }, codigoPostal);
        }

        // DELETE: api/CodigoPostals/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCodigoPostal(int id)
        {
            var codigoPostal = await _context.CodigoPostals.FindAsync(id);
            if (codigoPostal == null)
            {
                return NotFound();
            }

            _context.CodigoPostals.Remove(codigoPostal);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CodigoPostalExists(int id)
        {
            return _context.CodigoPostals.Any(e => e.Cp == id);
        }
    }
}

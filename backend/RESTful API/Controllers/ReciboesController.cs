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
    public class ReciboesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ReciboesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Reciboes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recibo>>> GetRecibos()
        {
            return await _context.Recibos.ToListAsync();
        }

        // GET: api/Reciboes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Recibo>> GetRecibo(int id)
        {
            var recibo = await _context.Recibos.FindAsync(id);

            if (recibo == null)
            {
                return NotFound();
            }

            return recibo;
        }

        // PUT: api/Reciboes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecibo(int id, Recibo recibo)
        {
            if (id != recibo.Idrecibo)
            {
                return BadRequest();
            }

            _context.Entry(recibo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReciboExists(id))
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

        // POST: api/Reciboes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Recibo>> PostRecibo(Recibo recibo)
        {
            _context.Recibos.Add(recibo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRecibo", new { id = recibo.Idrecibo }, recibo);
        }

        // DELETE: api/Reciboes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecibo(int id)
        {
            var recibo = await _context.Recibos.FindAsync(id);
            if (recibo == null)
            {
                return NotFound();
            }

            _context.Recibos.Remove(recibo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReciboExists(int id)
        {
            return _context.Recibos.Any(e => e.Idrecibo == id);
        }
    }
}

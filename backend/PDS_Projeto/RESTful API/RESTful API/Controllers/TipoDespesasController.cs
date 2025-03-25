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
    public class TipoDespesasController : ControllerBase
    {
        private readonly PdsContext _context;

        public TipoDespesasController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/TipoDespesas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDespesa>>> GetTipoDespesas()
        {
            return await _context.TipoDespesas.ToListAsync();
        }

        // GET: api/TipoDespesas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDespesa>> GetTipoDespesa(int id)
        {
            var tipoDespesa = await _context.TipoDespesas.FindAsync(id);

            if (tipoDespesa == null)
            {
                return NotFound();
            }

            return tipoDespesa;
        }

        // PUT: api/TipoDespesas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoDespesa(int id, TipoDespesa tipoDespesa)
        {
            if (id != tipoDespesa.Idtdespesa)
            {
                return BadRequest();
            }

            _context.Entry(tipoDespesa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoDespesaExists(id))
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

        // POST: api/TipoDespesas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoDespesa>> PostTipoDespesa(TipoDespesa tipoDespesa)
        {
            _context.TipoDespesas.Add(tipoDespesa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoDespesa", new { id = tipoDespesa.Idtdespesa }, tipoDespesa);
        }

        // DELETE: api/TipoDespesas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoDespesa(int id)
        {
            var tipoDespesa = await _context.TipoDespesas.FindAsync(id);
            if (tipoDespesa == null)
            {
                return NotFound();
            }

            _context.TipoDespesas.Remove(tipoDespesa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoDespesaExists(int id)
        {
            return _context.TipoDespesas.Any(e => e.Idtdespesa == id);
        }
    }
}

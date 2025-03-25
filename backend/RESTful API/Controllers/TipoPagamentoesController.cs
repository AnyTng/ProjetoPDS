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
    public class TipoPagamentoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public TipoPagamentoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/TipoPagamentoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoPagamento>>> GetTipoPagamentos()
        {
            return await _context.TipoPagamentos.ToListAsync();
        }

        // GET: api/TipoPagamentoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoPagamento>> GetTipoPagamento(int id)
        {
            var tipoPagamento = await _context.TipoPagamentos.FindAsync(id);

            if (tipoPagamento == null)
            {
                return NotFound();
            }

            return tipoPagamento;
        }

        // PUT: api/TipoPagamentoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTipoPagamento(int id, TipoPagamento tipoPagamento)
        {
            if (id != tipoPagamento.Idtpagamento)
            {
                return BadRequest();
            }

            _context.Entry(tipoPagamento).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TipoPagamentoExists(id))
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

        // POST: api/TipoPagamentoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TipoPagamento>> PostTipoPagamento(TipoPagamento tipoPagamento)
        {
            _context.TipoPagamentos.Add(tipoPagamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTipoPagamento", new { id = tipoPagamento.Idtpagamento }, tipoPagamento);
        }

        // DELETE: api/TipoPagamentoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTipoPagamento(int id)
        {
            var tipoPagamento = await _context.TipoPagamentos.FindAsync(id);
            if (tipoPagamento == null)
            {
                return NotFound();
            }

            _context.TipoPagamentos.Remove(tipoPagamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TipoPagamentoExists(int id)
        {
            return _context.TipoPagamentos.Any(e => e.Idtpagamento == id);
        }
    }
}

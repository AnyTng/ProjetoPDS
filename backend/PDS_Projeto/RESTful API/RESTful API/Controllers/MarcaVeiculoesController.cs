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
    public class MarcaVeiculoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public MarcaVeiculoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/MarcaVeiculoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MarcaVeiculo>>> GetMarcaVeiculos()
        {
            return await _context.MarcaVeiculos.ToListAsync();
        }

        // GET: api/MarcaVeiculoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MarcaVeiculo>> GetMarcaVeiculo(int id)
        {
            var marcaVeiculo = await _context.MarcaVeiculos.FindAsync(id);

            if (marcaVeiculo == null)
            {
                return NotFound();
            }

            return marcaVeiculo;
        }

        // PUT: api/MarcaVeiculoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMarcaVeiculo(int id, MarcaVeiculo marcaVeiculo)
        {
            if (id != marcaVeiculo.Idmarca)
            {
                return BadRequest();
            }

            _context.Entry(marcaVeiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MarcaVeiculoExists(id))
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

        // POST: api/MarcaVeiculoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<MarcaVeiculo>> PostMarcaVeiculo(MarcaVeiculo marcaVeiculo)
        {
            _context.MarcaVeiculos.Add(marcaVeiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMarcaVeiculo", new { id = marcaVeiculo.Idmarca }, marcaVeiculo);
        }

        // DELETE: api/MarcaVeiculoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarcaVeiculo(int id)
        {
            var marcaVeiculo = await _context.MarcaVeiculos.FindAsync(id);
            if (marcaVeiculo == null)
            {
                return NotFound();
            }

            _context.MarcaVeiculos.Remove(marcaVeiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MarcaVeiculoExists(int id)
        {
            return _context.MarcaVeiculos.Any(e => e.Idmarca == id);
        }
    }
}

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
    public class ModelosVeiculosController : ControllerBase
    {
        private readonly PdsContext _context;

        public ModelosVeiculosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/ModelosVeiculos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModeloVeiculo>>> GetModeloVeiculos()
        {
            return await _context.ModeloVeiculos.ToListAsync();
        }

        // GET: api/ModelosVeiculos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ModeloVeiculo>> GetModeloVeiculo(int id)
        {
            var modeloVeiculo = await _context.ModeloVeiculos.FindAsync(id);

            if (modeloVeiculo == null)
            {
                return NotFound();
            }

            return modeloVeiculo;
        }

        // PUT: api/ModelosVeiculos/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutModeloVeiculo(int id, ModeloVeiculo modeloVeiculo)
        {
            if (id != modeloVeiculo.Idmodelo)
            {
                return BadRequest();
            }

            _context.Entry(modeloVeiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ModeloVeiculoExists(id))
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

        // POST: api/ModelosVeiculos
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ModeloVeiculo>> PostModeloVeiculo(ModeloVeiculo modeloVeiculo)
        {
            _context.ModeloVeiculos.Add(modeloVeiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetModeloVeiculo", new { id = modeloVeiculo.Idmodelo }, modeloVeiculo);
        }

        // DELETE: api/ModelosVeiculos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteModeloVeiculo(int id)
        {
            var modeloVeiculo = await _context.ModeloVeiculos.FindAsync(id);
            if (modeloVeiculo == null)
            {
                return NotFound();
            }

            _context.ModeloVeiculos.Remove(modeloVeiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ModeloVeiculoExists(int id)
        {
            return _context.ModeloVeiculos.Any(e => e.Idmodelo == id);
        }
    }
}

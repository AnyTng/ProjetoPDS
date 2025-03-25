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
    public class ClasseVeiculoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ClasseVeiculoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/ClasseVeiculoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClasseVeiculo>>> GetClasseVeiculos()
        {
            return await _context.ClasseVeiculos.ToListAsync();
        }

        // GET: api/ClasseVeiculoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ClasseVeiculo>> GetClasseVeiculo(int id)
        {
            var classeVeiculo = await _context.ClasseVeiculos.FindAsync(id);

            if (classeVeiculo == null)
            {
                return NotFound();
            }

            return classeVeiculo;
        }

        // PUT: api/ClasseVeiculoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutClasseVeiculo(int id, ClasseVeiculo classeVeiculo)
        {
            if (id != classeVeiculo.IdclasseVeiculo)
            {
                return BadRequest();
            }

            _context.Entry(classeVeiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ClasseVeiculoExists(id))
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

        // POST: api/ClasseVeiculoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ClasseVeiculo>> PostClasseVeiculo(ClasseVeiculo classeVeiculo)
        {
            _context.ClasseVeiculos.Add(classeVeiculo);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClasseVeiculo", new { id = classeVeiculo.IdclasseVeiculo }, classeVeiculo);
        }

        // DELETE: api/ClasseVeiculoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClasseVeiculo(int id)
        {
            var classeVeiculo = await _context.ClasseVeiculos.FindAsync(id);
            if (classeVeiculo == null)
            {
                return NotFound();
            }

            _context.ClasseVeiculos.Remove(classeVeiculo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ClasseVeiculoExists(int id)
        {
            return _context.ClasseVeiculos.Any(e => e.IdclasseVeiculo == id);
        }
    }
}

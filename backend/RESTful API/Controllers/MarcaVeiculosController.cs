using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;   // ajusta se o namespace for outro

namespace RESTful_API.Controllers
{
    // DTO para um modelo
    public class ModeloVeiculoDTO
    {
        public int Idmodelo { get; set; }
        public string? DescModelo { get; set; }
    }

    // DTO para uma marca + lista de modelos
    public class MarcaVeiculoEditDTO
    {
        public int Idmarca { get; set; }
        public string? DescMarca { get; set; }
        public List<ModeloVeiculoDTO> Modelos { get; set; } = new();
    }

    [Route("api/[controller]")]
    [ApiController]
    public class MarcaVeiculosController : ControllerBase
    {
        private readonly PdsContext _context;

        public MarcaVeiculosController(PdsContext context)
            => _context = context;

        // ----------------------------------------------------------
        // GET: api/MarcaVeiculos          ← devolve TODAS as marcas + modelos
        // ----------------------------------------------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MarcaVeiculoEditDTO>>> GetMarcaVeiculos()
        {
            // Faz um GroupJoin (LEFT JOIN) entre marcas e modelos
            var dtos = await _context.MarcaVeiculos
                .GroupJoin(
                    _context.ModeloVeiculos,                       // tabela dos modelos
                    marca  => marca.Idmarca,                       // FK na marca
                    modelo => modelo.MarcaVeiculoIdmarca,          // FK no modelo
                    (marca, modelos) => new MarcaVeiculoEditDTO
                    {
                        Idmarca   = marca.Idmarca,
                        DescMarca = marca.DescMarca,
                        Modelos   = modelos.Select(md => new ModeloVeiculoDTO {
                                        Idmodelo   = md.Idmodelo,
                                        DescModelo = md.DescModelo
                                    })
                                    .ToList()
                    })
                .ToListAsync();

            return dtos;
        }

        // ----------------------------------------------------------
        // GET: api/MarcaVeiculos/5        ← devolve UMA marca + modelos
        // ----------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<ActionResult<MarcaVeiculoEditDTO>> GetMarcaVeiculo(int id)
        {
            var dto = await _context.MarcaVeiculos
                .Where(m => m.Idmarca == id)
                .GroupJoin(
                    _context.ModeloVeiculos,
                    marca  => marca.Idmarca,
                    modelo => modelo.MarcaVeiculoIdmarca,
                    (marca, modelos) => new MarcaVeiculoEditDTO
                    {
                        Idmarca   = marca.Idmarca,
                        DescMarca = marca.DescMarca,
                        Modelos   = modelos.Select(md => new ModeloVeiculoDTO {
                                        Idmodelo   = md.Idmodelo,
                                        DescModelo = md.DescModelo
                                    })
                                    .ToList()
                    })
                .FirstOrDefaultAsync();

            if (dto == null)
                return NotFound();

            return dto;
        }

        // ----------------------------------------------------------
        // PUT: api/MarcaVeiculos/5
        // ----------------------------------------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMarcaVeiculo(int id, MarcaVeiculoEditDTO dto)
        {
            if (id != dto.Idmarca)
                return BadRequest();

            var entity = await _context.MarcaVeiculos.FindAsync(id);
            if (entity == null)
                return NotFound();

            entity.DescMarca = dto.DescMarca;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!MarcaVeiculoExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        // ----------------------------------------------------------
        // POST: api/MarcaVeiculos
        // ----------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult<MarcaVeiculoEditDTO>> PostMarcaVeiculo(MarcaVeiculoEditDTO dto)
        {
            var entity = new MarcaVeiculo { DescMarca = dto.DescMarca };

            _context.MarcaVeiculos.Add(entity);
            await _context.SaveChangesAsync();

            dto.Idmarca = entity.Idmarca;
            dto.Modelos.Clear();       // nenhum modelo aquando da criação

            return CreatedAtAction(nameof(GetMarcaVeiculo),
                                   new { id = dto.Idmarca },
                                   dto);
        }

        // ----------------------------------------------------------
        // DELETE: api/MarcaVeiculos/5
        // ----------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMarcaVeiculo(int id)
        {
            var entity = await _context.MarcaVeiculos.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.MarcaVeiculos.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool MarcaVeiculoExists(int id)
            => _context.MarcaVeiculos.Any(e => e.Idmarca == id);
    }
}
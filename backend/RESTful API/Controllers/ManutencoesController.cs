using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManutencoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public ManutencoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Manutencoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetManutencaos()
        {
            return await _context.Manutencaos.ToListAsync();
        }

        // GET: api/Manutencoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Manutencao>> GetManutencao(int id)
        {
            var manutencao = await _context.Manutencaos.FindAsync(id);

            if (manutencao == null)
            {
                return NotFound();
            }

            return manutencao;
        }

        // PUT: api/Manutencoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutManutencao(int id, Manutencao manutencao)
        {
            if (id != manutencao.Idmanutencao)
            {
                return BadRequest();
            }

            _context.Entry(manutencao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ManutencaoExists(id))
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

        // POST: api/Manutencoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Manutencao>> PostManutencao(Manutencao manutencao)
        {
            _context.Manutencaos.Add(manutencao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetManutencao", new { id = manutencao.Idmanutencao }, manutencao);
        }

        // DELETE: api/Manutencoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManutencao(int id)
        {
            var manutencao = await _context.Manutencaos.FindAsync(id);
            if (manutencao == null)
            {
                return NotFound();
            }

            _context.Manutencaos.Remove(manutencao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ManutencaoExists(int id)
        {
            return _context.Manutencaos.Any(e => e.Idmanutencao == id);
        }

        /////////////////////
        /// Administrador
        [HttpPost("responderconcurso")]
        public async Task<ActionResult<Manutencao>> ResponderConcurso(int idConcurso, string descProposta, float valorProposta, DateTime dataIn)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 2) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var concurso = _context.Despesas.FirstOrDefault(v => v.Iddespesa == idConcurso);
            if (concurso == null)
            {
                return NotFound("Proposta não encontrado.");
            }

            var empresa = _context.Empresas.FirstOrDefault(v => v.LoginIdlogin == userIdLogin);
            if (empresa == null)
            {
                return NotFound("Utilizador não encontrado.");
            }


            var proposta = new Manutencao
            {
                DescProposta = descProposta,
                ValorProposta = valorProposta,
                EstadoProposta = "Pendente",
                DataInicioMan = dataIn,
                DataFimMan = null,
                EmpresaIdempresa = empresa.Idempresa,
                DespesaIddespesa = concurso.Iddespesa

            };


            _context.Manutencaos.Add(proposta);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetManutencao", new { id = proposta.Idmanutencao }, proposta);

        }





        ////////////
        ///EMP
        ///
        [HttpGet("PropostaEmp")]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetConcursosEmp()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 2)
            {
                return Forbid("Acesso restrito a Empresas.");
            }

            // Buscar todas as manutenções da empresa
            var manutencoes = await _context.Manutencaos
                .Where(m => m.EmpresaIdempresaNavigation.LoginIdlogin == userIdLogin)
                .ToListAsync();


            return manutencoes;
        }
    }
}

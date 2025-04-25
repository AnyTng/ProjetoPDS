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





        ////////////
        ///EMP
        ///
        [HttpPost("FazerProposta")]
        public async Task<ActionResult<Manutencao>> FazerProposta(int idConcurso, string descProposta, float valorProposta, DateTime dataIn, DateTime dataFim)
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
                DataFimMan = dataFim,
                EmpresaIdempresa = empresa.Idempresa,
                DespesaIddespesa = concurso.Iddespesa

            };


            _context.Manutencaos.Add(proposta);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetManutencao", new { id = proposta.Idmanutencao }, proposta);

        }


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

        /////////////////////
        /// Administrador
        /// 
        [HttpGet("VerPropostaAdmin")]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetEscolherP(int idConcurso)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            // Buscar todas as manutenções da empresa
            var manutencoes = await _context.Manutencaos
                .Where(m => m.DespesaIddespesa==idConcurso)
                .ToListAsync();

            return manutencoes;
        }

        [HttpPut("AceitarProposta")]
        public async Task<IActionResult> AceitarProposta(int idProposta)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var proposta = await _context.Manutencaos.FindAsync(idProposta);
            if (proposta == null)
            {
                return NotFound();
            }

            proposta.EstadoProposta = "Aceite";
            /*

            //quero que envie um email para a em presa 
            //enviar email para a empresa
            var empresa = await _context.Empresas.FindAsync(proposta.EmpresaIdempresa);
            if (empresa != null)
            {
                var email = empresa.LoginIdloginNavigation.Email;
                var assunto = "Proposta Aceite";
                var mensagem = $"A sua proposta com o ID {proposta.Idmanutencao} foi aceite.";
                await _emailService.EnviarEmail(email, assunto, mensagem);
            }
            */








            var manutencoes = await _context.Manutencaos
                .Where(m => m.DespesaIddespesa == proposta.DespesaIddespesa && 
                m.Idmanutencao!= idProposta)
                .ToListAsync();

            //MUDAR O EstadoProposta DE OUTRAS PROPOSTAS PARA REJEITADA
            foreach (var m in manutencoes)
            {
                m.EstadoProposta = "Rejeitada";
            }

            // Atualizar o estado da despesa para "Em Andamento"
            var despesa = await _context.Despesas.FindAsync(proposta.DespesaIddespesa);
            if (despesa != null)
            {
                despesa.EstadoConcurso = "Encerrado";
            }

            //selecionar o veiculo associado ao ao concurso e modar a seu estado para "Em Manutencao"
            var veiculo = await _context.Veiculos
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                    .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .FirstOrDefaultAsync(v => v.Idveiculo == proposta.DespesaIddespesaNavigation.VeiculoIdveiculo);
            if (veiculo != null)
            {
                veiculo.EstadoVeiculo = "Em Manutencao";
            }



            _context.Entry(proposta).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ManutencaoExists(idProposta))
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

    }
}

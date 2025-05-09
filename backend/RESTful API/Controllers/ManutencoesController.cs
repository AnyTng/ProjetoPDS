using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Interface;
using RESTful_API.Models;
using RESTful_API.Service;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ManutencoesController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IEmailService _emailService;

        public ManutencoesController(PdsContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        private bool ManutencaoExists(int id)
        {
            return _context.Manutencaos.Any(e => e.Idmanutencao == id);
        }

        // GET api/Manutencoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Manutencao>> GetManutencao(int id)
        {
            var man = await _context.Manutencaos.FindAsync(id);
            if (man == null)
                return NotFound();
            return Ok(man);
        }

        // GET api/Manutencoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetManutencaos()
        {
            return await _context.Manutencaos.ToListAsync();
        }

        // GET api/Manutencoes/PropostaEmp
        [HttpGet("PropostaEmp")]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetConcursosEmp()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim  = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 2)
            {
                return Forbid("Acesso restrito a Empresas.");
            }

            var login = await _context.Logins
                .Where(l => l.Idlogin == userIdLogin)
                .FirstAsync();
            if (login.HashPassword == null || userTipoLogin != login.TipoLoginIdtlogin)
            {
                return Forbid("Acesso restrito a cliente com password definida.");
            }

            var manutencoes = await _context.Manutencaos
                .Include(m => m.DespesaIddespesaNavigation)
                    .ThenInclude(d => d.VeiculoIdveiculoNavigation)
                        .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                            .ThenInclude(mo => mo.MarcaVeiculoIdmarcaNavigation)
                .Where(m => m.EmpresaIdempresaNavigation.LoginIdlogin == userIdLogin)
                .ToListAsync();

            return manutencoes;
        }

        // GET api/Manutencoes/VerPropostaAdmin?idConcurso=#
        [HttpGet("VerPropostaAdmin")]
        public async Task<ActionResult<IEnumerable<Manutencao>>> GetEscolherP(int idConcurso)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim  = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var login = await _context.Logins
                .Where(l => l.Idlogin == userIdLogin)
                .FirstAsync();
            if (login.HashPassword == null || userTipoLogin != login.TipoLoginIdtlogin)
            {
                return Forbid("Acesso restrito a cliente com password definida.");
            }

            var manutencoes = await _context.Manutencaos
                .Include(m => m.EmpresaIdempresaNavigation)
                .Where(m => m.DespesaIddespesa == idConcurso)
                .ToListAsync();

            return manutencoes;
        }

        // POST api/Manutencoes/FazerProposta
        [HttpPost("FazerProposta")]
        public async Task<ActionResult<Manutencao>> FazerProposta(
            int idConcurso,
            string descProposta,
            float valorProposta,
            DateTime dataIn,
            DateTime dataFim)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim  = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 2)
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var login = await _context.Logins
                .Where(l => l.Idlogin == userIdLogin)
                .FirstAsync();
            if (login.HashPassword == null || userTipoLogin != login.TipoLoginIdtlogin)
            {
                return Forbid("Acesso restrito a cliente com password definida.");
            }

            var concurso = await _context.Despesas
                .FirstOrDefaultAsync(v => v.Iddespesa == idConcurso);
            if (concurso == null)
                return NotFound("Proposta não encontrada.");

            var empresa = await _context.Empresas
                .FirstOrDefaultAsync(v => v.LoginIdlogin == userIdLogin);
            if (empresa == null)
                return NotFound("Utilizador não encontrado.");

            var proposta = new Manutencao
            {
                DescProposta      = descProposta,
                ValorProposta     = valorProposta,
                EstadoProposta    = "Pendente",
                DataInicioMan     = dataIn,
                DataFimMan        = dataFim,
                EmpresaIdempresa  = empresa.Idempresa,
                DespesaIddespesa  = concurso.Iddespesa
            };

            _context.Manutencaos.Add(proposta);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetManutencao),
                new { id = proposta.Idmanutencao },
                proposta);
        }

        // PUT api/Manutencoes/AceitarProposta?idProposta=#
        [HttpPut("AceitarProposta")]
        public async Task<IActionResult> AceitarProposta(int idProposta)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim  = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) ||
                !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var loginteste = await _context.Logins
                .Where(l => l.Idlogin == userIdLogin)
                .FirstAsync();
            if (loginteste.HashPassword == null || userTipoLogin != loginteste.TipoLoginIdtlogin)
            {
                return Forbid("Acesso restrito a cliente com password definida.");
            }

            var proposta = await _context.Manutencaos.FindAsync(idProposta);
            if (proposta == null)
                return NotFound();

            proposta.EstadoProposta = "Aceite";

            // Enviar email de confirmação
            var empresa = await _context.Empresas.FindAsync(proposta.EmpresaIdempresa);
            var login   = await _context.Logins.FindAsync(empresa.LoginIdlogin);
            if (empresa != null && login != null)
            {
                var assunto  = "Proposta Aceite";
                var mensagem =
                    $"Caro/a {empresa.FuncionarioEmpresa},<br/>" +
                    $"A sua proposta \"{proposta.DescProposta}\" (ID {proposta.Idmanutencao}) foi aceite.<br/><br/>" +
                    $"Com os melhores cumprimentos,<br/>" +
                    $"<b><i>CarXpress Team</i></b>";
                await _emailService.EnviarEmail(login.Email, assunto, mensagem);
            }

            // Rejeitar restantes propostas
            var outras = await _context.Manutencaos
                .Where(m => m.DespesaIddespesa == proposta.DespesaIddespesa
                         && m.Idmanutencao != idProposta)
                .ToListAsync();
            outras.ForEach(m => m.EstadoProposta = "Rejeitada");

            // Atualizar estado da despesa e do veículo
            var despesa = await _context.Despesas.FindAsync(proposta.DespesaIddespesa);
            if (despesa != null)
                despesa.EstadoConcurso = "Em Manutencao";

            var veiculo = await _context.Veiculos
                .FirstOrDefaultAsync(v => v.Idveiculo == proposta.DespesaIddespesaNavigation.VeiculoIdveiculo);
            if (veiculo != null)
                veiculo.EstadoVeiculo = "Em Manutencao";

            _context.Entry(proposta).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ManutencaoExists(idProposta))
                    return NotFound();
                throw;
            }

            return NoContent();
        }
    }
}
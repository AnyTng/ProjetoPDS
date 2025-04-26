using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using RESTful_API.Models;
using RESTful_API.Interface;
using RESTful_API.Service;



namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InfracoesController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IEmailService _emailService;

        public InfracoesController(PdsContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/Infracoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Infracao>>> GetInfracoes()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)//verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }

            return await _context.Infracoes
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.ClienteIdclienteNavigation)
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.VeiculoIdveiculoNavigation)
                        .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                            .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .ToListAsync();
        }

        // GET: api/Infracoes/5
        [HttpGet("MultasCliente")]
        public async Task<ActionResult<Infracao>> GetInfracao()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1)//verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }

            var cliente = await _context.Clientes
                                        .Include(c => c.CodigoPostalCpNavigation)
                                        .FirstOrDefaultAsync(c => c.LoginIdlogin == userIdLogin);

            var infracoes = await _context.Infracoes
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.ClienteIdclienteNavigation)
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.VeiculoIdveiculoNavigation)
                        .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                            .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Where(i => i.AluguerIdaluguerNavigation.ClienteIdcliente == cliente.Idcliente)
                .ToListAsync();


            if (infracoes == null)
            {
                return NotFound("Sem Infrações");
            }

            return Ok(infracoes);
        }

        // PUT: api/Infracoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutInfracao(int id, Infracao infracao)
        {
            if (id != infracao.Idinfracao)
            {
                return BadRequest();
            }

            _context.Entry(infracao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InfracaoExists(id))
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

        // POST: api/Infracoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Infracao>> PostInfracao(Infracao infracao)
        {
            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetInfracao", new { id = infracao.Idinfracao }, infracao);
        }

        // DELETE: api/Infracoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInfracao(int id)
        {
            var infracao = await _context.Infracoes.FindAsync(id);
            if (infracao == null)
            {
                return NotFound();
            }

            _context.Infracoes.Remove(infracao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InfracaoExists(int id)
        {
            return _context.Infracoes.Any(e => e.Idinfracao == id);
        }



        //
        //     Admin insere multa
        //

        [HttpPost("inserir-multa")]
        public async Task<IActionResult> InserirMulta(DateTime dataInfracao, float valorInfracao, string matricula, string descInfracao, DateTime dataLimPagInfracoes)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)//verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }

            var veiculo = await _context.Veiculos
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                    .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .FirstOrDefaultAsync(v => v.MatriculaVeiculo == matricula);
            if (veiculo == null)
            {
                return NotFound("Veículo não encontrado para a matrícula fornecida.");
            }

            var aluguer = await _context.Aluguers
                .Include(a => a.VeiculoIdveiculoNavigation)
                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Where(a => a.VeiculoIdveiculoNavigation.MatriculaVeiculo == matricula &&
                            a.DataDevolucao >= dataInfracao &&
                            a.DataLevantamento <= dataInfracao)
                .FirstOrDefaultAsync();

            if (aluguer == null) {
                return NotFound("Aluguer não encontrado para a matrícula fornecida.");
            }

            int saveIDA = aluguer.Idaluguer;


            var infracao = new Infracao
            {
                AluguerIdaluguer = aluguer.Idaluguer,
                DataInfracao = dataInfracao,
                ValorInfracao = valorInfracao,
                DescInfracao = descInfracao,
                EstadoInfracao = "Submetida",
                DataLimPagInfracoes = dataLimPagInfracoes
            };

            var cliente = await _context.Clientes
                .Include(c => c.LoginIdloginNavigation)
                .FirstOrDefaultAsync(c => c.Idcliente == aluguer.ClienteIdcliente);

            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();

            int idInfracao = await _context.Infracoes
                .Where(i => i.AluguerIdaluguer == saveIDA && i.DataInfracao == dataInfracao)
                .Select(i => i.Idinfracao)
                .FirstOrDefaultAsync();

            if (cliente != null)
            {
                var email = "linoazevedo100@gmail.com";// empresa.LoginIdloginNavigation.Email;
                var assunto = "Proposta Aceite";
                var mensagem = $"Caro/a {cliente.NomeCliente}.<br>Vimos por este meio lhe informar, que no dia {infracao.DataInfracao}." +
                                $"<br><br><br>__<br>" +
                                $"Com os melhores cumprimentos,<br>" +
                                $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                await _emailService.EnviarEmail(email, assunto, mensagem);
            }
            /*if (dataInfracao != null)
            {
                if (cliente.LoginIdlogin != null)
                {
                    var notificacaoData = new
                    {
                        idInfracao,
                        aluguer.Idaluguer
                    };

                    var jsonData = JsonSerializer.Serialize(notificacaoData);

                    var notificacao = new Notificacao
                    {
                        ConteudoNotif = jsonData,
                        LoginIdlogin = cliente.LoginIdlogin,
                        TipoNotificacao = 1 // 1 - Multa
                    };

                    _context.Notificacaos.Add(notificacao);
                    await _context.SaveChangesAsync(); // <<< ESTA LINHA ESTAVA FALTANDO
                }
                else
                {
                    return NotFound("Erro ao imitir notificação, processo cancelado");
                }
            }*/


            return CreatedAtAction(nameof(GetInfracao), new { id = infracao.Idinfracao }, infracao);
               
        }

    }
}

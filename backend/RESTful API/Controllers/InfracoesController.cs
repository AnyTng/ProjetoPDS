using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InfracoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public InfracoesController(PdsContext context)
        {
            _context = context;
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
        public async Task<IActionResult> InserirMulta(DateTime dataInfracao, float valorInfracao, string matricula, string descInfracao)
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


            var infracao = new Infracao
            {
                AluguerIdaluguer = aluguer.Idaluguer,
                DataInfracao = dataInfracao,
                ValorInfracao = valorInfracao,
                DescInfracao = descInfracao,
                EstadoInfracao = "Submetida"
            };

            var cliente = await _context.Clientes
                .Include(c => c.LoginIdloginNavigation)
                .FirstOrDefaultAsync(c => c.Idcliente == aluguer.ClienteIdcliente);


            if (infracao.DataInfracao != null)
            {

                if (cliente.LoginIdlogin != null)
                {
                    var notificacaoData = new
                    {
                        Cliente = new
                        {
                            cliente.NomeCliente,
                            cliente.Nifcliente,
                            cliente.ContactoC1,
                            cliente.LoginIdloginNavigation.Email

                        },
                        Multa = new
                        {
                            infracao.Idinfracao,
                            infracao.DataInfracao,
                            infracao.ValorInfracao,
                            infracao.DescInfracao
                        },
                        Aluguer = new
                        {
                            aluguer.Idaluguer,
                            aluguer.DataLevantamento,
                            aluguer.DataDevolucao,
                            aluguer.VeiculoIdveiculoNavigation.MatriculaVeiculo,
                            aluguer.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                            aluguer.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.DescModelo,
                        }
                    };

                    var jsonData = JsonSerializer.Serialize(notificacaoData);

                    var notificacao = new Notificacao
                    {
                        ConteudoNotif = jsonData,
                        LoginIdlogin = cliente.LoginIdlogin,
                    };

                    _context.Notificacaos.Add(notificacao);

                }
                else
                {
                    return NotFound("Erro ao imitir notificação, processo cancelado");

                }
            }

            _context.Infracoes.Add(infracao);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInfracao), new { id = infracao.Idinfracao }, infracao);
               
        }

    }
}

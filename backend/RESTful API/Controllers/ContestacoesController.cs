using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;
using RESTful_API.Service;
using RESTful_API.Interface;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Security.Cryptography;


namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContestacoesController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IEmailService _emailService;

        public ContestacoesController(PdsContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;

        }

        // GET: api/Contestacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contestacao>>> GetContestacaos()
        {
            return await _context.Contestacaos.ToListAsync();
        }

        // GET: api/Contestacoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Contestacao>> GetContestacao(int id)
        {
            var contestacao = await _context.Contestacaos.FindAsync(id);

            if (contestacao == null)
            {
                return NotFound();
            }

            return contestacao;
        }

        // PUT: api/Contestacoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContestacao(int id, Contestacao contestacao)
        {
            if (id != contestacao.Idcontestacao)
            {
                return BadRequest();
            }

            _context.Entry(contestacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContestacaoExists(id))
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

        // POST: api/Contestacoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Contestacao>> PostContestacao(Contestacao contestacao)
        {
            _context.Contestacaos.Add(contestacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetContestacao", new { id = contestacao.Idcontestacao }, contestacao);
        }

        // DELETE: api/Contestacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContestacao(int id)
        {
            var contestacao = await _context.Contestacaos.FindAsync(id);
            if (contestacao == null)
            {
                return NotFound();
            }

            _context.Contestacaos.Remove(contestacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ContestacaoExists(int id)
        {
            return _context.Contestacaos.Any(e => e.Idcontestacao == id);
        }


        //////////
        ///Cliente
        ///

        // cria contestaçao pelo id do token e recebe idinfraçao

        [HttpPost("CriarContestacao")]
        public async Task<IActionResult> CriarContestacao(string descContestacao, int idInf)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1)
            {
                return Forbid("Acesso restrito a cliente.");
            }

            var cliente = await _context.Clientes
                                        .Include(c => c.CodigoPostalCpNavigation)
                                        .FirstOrDefaultAsync(c => c.LoginIdlogin == userIdLogin);
            if (cliente == null)
            {
                return NotFound("Cliente não encontrado.");
            }
            var contestacao = new Contestacao
            {
                ClienteIdcliente = cliente.Idcliente, // Aqui você deve definir o ID do cliente relacionado
                DescContestacao = descContestacao, // Aqui você pode definir a descrição da contestação
                EstadoContestacao = "Pendente", // Estado inicial da contestação
                InfracoesIdinfracao = idInf // Aqui você deve definir o ID da infração relacionada
            };

            // Adiciona a contestação ao contexto
            _context.Contestacaos.Add(contestacao);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetContestacao), new { id = contestacao.Idcontestacao }, contestacao);
        }

        ////////
        ///Admin
        ///

        // put para aceitar ou negar contestacao
        [HttpPut("AlterarContestacao")]
        public async Task<IActionResult> AlterarContestacao(int id, string estadoContestacao)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3)
            {
                return Forbid("Acesso restrito a administrador.");
            }

            var contestacao = await _context.Contestacaos.FindAsync(id);
            if (contestacao == null)
            {
                return NotFound("Contestação não encontrada.");
            }
            if (estadoContestacao != "Aceite" && estadoContestacao != "Negada")
            {
                return BadRequest("Estado da contestação inválido. Deve ser 'Aceite' ou 'Negada'.");
            }
            contestacao.EstadoContestacao = estadoContestacao;
            _context.Entry(contestacao).State = EntityState.Modified;

            var cliente = await _context.Clientes
                .Include(c => c.LoginIdloginNavigation)
                .FirstOrDefaultAsync(c => c.Idcliente == contestacao.ClienteIdcliente);

            var infracao = await _context.Infracoes
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.VeiculoIdveiculoNavigation)
                .FirstOrDefaultAsync(i => i.Idinfracao == contestacao.InfracoesIdinfracao);
            
            var veiculo = await _context.Veiculos
                .Where(v => v.Idveiculo == infracao.AluguerIdaluguerNavigation.VeiculoIdveiculo)
                .FirstOrDefaultAsync();

            if (cliente != null && estadoContestacao == "Aceite")
            {
                var email = cliente.LoginIdloginNavigation.Email;
                var assunto = "Notificação de Infração - Resolução da sua contestacao";
                var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>Vimos por este meio informá-lo(a) de que, a sua contestação à multa do dia {infracao.DataInfracao} com descrição { infracao.DescInfracao}, no aluguer do veículo { veiculo.MatriculaVeiculo}, foi Aceite.<br><br>" +
                                $"<br><br><br>__<br>" +
                                $"Com os melhores cumprimentos,<br>" +
                                $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                await _emailService.EnviarEmail(email, assunto, mensagem);
            }

            if (cliente != null && estadoContestacao == "Negada")
            {
                var email = cliente.LoginIdloginNavigation.Email;
                var assunto = "Notificação de Infração - Resolução da sua contestacao";
                var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>Vimos por este meio informá-lo(a) de que, a sua contestação à multa do dia {infracao.DataInfracao} com descrição {infracao.DescInfracao}, no aluguer do veículo {veiculo.MatriculaVeiculo}, foi Negada.<br><br>Solicitamos que vossa Ex. aceda ao nosso site para efetuar o pagamento até {infracao.DataLimPagInfracoes}.<br><br>" +
                                $"<br><br><br>__<br>" +
                                $"Com os melhores cumprimentos,<br>" +
                                $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                await _emailService.EnviarEmail(email, assunto, mensagem);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContestacaoExists(id))
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



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

        private bool ContestacaoExists(int id)
        {
            return _context.Contestacaos.Any(e => e.Idcontestacao == id);
        }

        //////////
        /// Cliente
        //////////

        // cria contestação pelo id do token e recebe id infracao
        [HttpPost("CriarContestacao")]
        public async Task<IActionResult> CriarContestacao(string descContestacao, int idInf)
        {
            var idLoginClaim  = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim   = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin)
                || !int.TryParse(roleIdClaim, out int userTipoLogin)
                || userIdLogin  <= 0
                || userTipoLogin <= 0)
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1)
            {
                return Forbid("Acesso restrito para clientes.");
            }

            var cliente = await _context.Clientes
                                        .Include(c => c.CodigoPostalCpNavigation)
                                        .FirstOrDefaultAsync(c => c.LoginIdlogin == userIdLogin);
            if (cliente == null)
            {
                return NotFound("Cliente não encontrado.");
            }

            // Verifica se a infração existe
            var infracao = await _context.Infracoes.FindAsync(idInf);
            if (infracao == null)
            {
                return NotFound("Infração não encontrada.");
            }
            // Verifica se a infração já tem uma contestação
            var contestacaoExistente = await _context.Contestacaos
                .FirstOrDefaultAsync(c => c.InfracoesIdinfracao == idInf);
            if (contestacaoExistente != null)
            {
                return BadRequest("Já existe uma contestação para esta infração.");
            }
            // Cria a nova contestação
            var contestacao = new Contestacao
            {
                ClienteIdcliente    = cliente.Idcliente,
                DescContestacao     = descContestacao,
                EstadoContestacao   = "Pendente",
                InfracoesIdinfracao = idInf
            };
            // Muda estado da infração para "Contestada"
            infracao.EstadoInfracao = "Contestada";
            _context.Entry(infracao).State = EntityState.Modified;

            // Adiciona a contestação ao contexto
            _context.Contestacaos.Add(contestacao);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetContestacao), new { id = contestacao.Idcontestacao }, contestacao);
        }

        ////////
        /// Admin
        ////////

        // altera contestação (aceita ou nega)
        [HttpPut("AlterarContestacao")]
        public async Task<IActionResult> AlterarContestacao(int id, string estadoContestacao)
        {
            var idLoginClaim  = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim   = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin)
                || !int.TryParse(roleIdClaim, out int userTipoLogin)
                || userIdLogin  <= 0
                || userTipoLogin <= 0)
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
                                        .FirstOrDefaultAsync(v => v.Idveiculo == infracao.AluguerIdaluguerNavigation.VeiculoIdveiculo);

            if (cliente != null && estadoContestacao == "Aceite")
            {
                var email   = cliente.LoginIdloginNavigation.Email;
                var assunto = "Notificação de Infração - Resolução da sua contestação";
                var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>" +
                               $"Informamos que a sua contestação à multa do dia {infracao.DataInfracao:dd/MM/yyyy} " +
                               $"com descrição \"{infracao.DescInfracao}\" no veículo {veiculo.MatriculaVeiculo} foi <b>Aceite</b>.<br><br>" +
                               $"Com os melhores cumprimentos,<br>" +
                               $"<i>CarXpress Team</i>";
                await _emailService.EnviarEmail(email, assunto, mensagem);

                infracao.EstadoInfracao = "Contestação Aceite";
                _context.Entry(infracao).State = EntityState.Modified;
            }

            if (cliente != null && estadoContestacao == "Negada")
            {
                var email   = cliente.LoginIdloginNavigation.Email;
                var assunto = "Notificação de Infração - Resolução da sua contestação";
                var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>" +
                               $"A sua contestação à multa do dia {infracao.DataInfracao:dd/MM/yyyy} " +
                               $"foi <b>Negada</b>. Por favor, efetue o pagamento até {infracao.DataLimPagInfracoes:dd/MM/yyyy}.<br><br>" +
                               $"Com os melhores cumprimentos,<br>" +
                               $"<i>CarXpress Team</i>";
                await _emailService.EnviarEmail(email, assunto, mensagem);

                infracao.EstadoInfracao = "Contestação Negada";
                _context.Entry(infracao).State = EntityState.Modified;
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
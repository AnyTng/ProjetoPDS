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
using Stripe.Checkout;
using Stripe;



namespace RESTful_API.Controllers
{
    // DTO
    public class InfDTO
    {
        public DateTime? DataInicio { get; set; }
        public DateTime? DataDevolucao { get; set; }
        public DateTime? DataInf { get; set; }
        public double? ValorInf { get; set; }
        public string? DescInf { get; set; }
        public string? EstadoInf { get; set; }
        public DateTime? DataLimPagInf { get; set; }
        public int? Idinf { get; set; }
        public string? MatriculaVeiculo { get; set; }
        public string? NomeCliente { get; set; }
        public string EmailCliente { get; set; }
        public string NomeMarca { get; set; }
        public string NomeModelo { get; set; }
        public int? NifCliente { get; set; }
        public int? TelefoneCliente { get; set; }
        public int? IdCont { get; set; }
        public string EstadoContestacao { get; set; }
        public string DescContestacao { get; set; }
    }


    [Route("api/[controller]")]
    [ApiController]
    public class InfracoesController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public InfracoesController(PdsContext context, IEmailService emailService, IConfiguration config)
        {
            _context = context;
            _emailService = emailService;
            _config = config;

            // Carrega a chave secreta Stripe (uma única vez)
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        // GET: api/Infracoes
        [HttpGet("vermultasAdmin")]
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

            var infracoes = await _context.Infracoes
                            .Include(i => i.AluguerIdaluguerNavigation)
                                .ThenInclude(a => a.ClienteIdclienteNavigation)
                            .Include(i => i.AluguerIdaluguerNavigation)
                                .ThenInclude(a => a.VeiculoIdveiculoNavigation)
                                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                            .ToListAsync();

            if (infracoes == null || !infracoes.Any())
            {
                return NotFound("Sem Infrações.");
            }

            var infracaoDTOs = new List<InfDTO>();

            foreach (var infracao in infracoes)
            {
                var contestacao = await _context.Contestacaos
                    .Where(c => c.InfracoesIdinfracao == infracao.Idinfracao)
                    .Select(c => new
                    {
                        c.Idcontestacao,
                        c.DescContestacao,
                        c.EstadoContestacao
                    })
                    .FirstOrDefaultAsync();

                var dto = new InfDTO
                {
                    DataInicio = infracao.AluguerIdaluguerNavigation?.DataLevantamento,
                    DataDevolucao = infracao.AluguerIdaluguerNavigation?.DataDevolucao,
                    DataInf = infracao.DataInfracao,
                    ValorInf = infracao.ValorInfracao,
                    DescInf = infracao.DescInfracao,
                    EstadoInf = infracao.EstadoInfracao,
                    DataLimPagInf = infracao.DataLimPagInfracoes,
                    Idinf = infracao.Idinfracao,
                    MatriculaVeiculo = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.MatriculaVeiculo,
                    NomeCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.NomeCliente,
                    EmailCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.LoginIdloginNavigation?.Email,
                    NomeMarca = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation?.MarcaVeiculoIdmarcaNavigation?.DescMarca,
                    NomeModelo = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation?.DescModelo,
                    NifCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.Nifcliente,
                    TelefoneCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.ContactoC1,
                    IdCont = contestacao?.Idcontestacao ?? 0,
                    EstadoContestacao = contestacao?.EstadoContestacao,
                    DescContestacao = contestacao?.DescContestacao
                };


                infracaoDTOs.Add(dto);
            }

            return Ok(infracaoDTOs);
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
            if (userTipoLogin != 1)
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



        ///////////////////
        //     Admin 
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
                var email = cliente.LoginIdloginNavigation.Email;
                var assunto = "Notificação de Infração - Ação Necessária";
                var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>Vimos por este meio informá-lo(a) de que, no dia {infracao.DataInfracao}, a quando o veículo ({matricula}) alugado estava em sua posse," +
                    $" foi registada a seguinte infração: {infracao.DescInfracao}.<br><br>Solicitamos que aceda ao nosso site para efetuar o pagamento até {infracao.DataLimPagInfracoes}." +
                    $"<br><br>Agradecemos a sua atenção a este assunto.<br><br>" +
                                $"<br><br><br>__<br>" +
                                $"Com os melhores cumprimentos,<br>" +
                                $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                await _emailService.EnviarEmail(email, assunto, mensagem);
            }

            return CreatedAtAction(nameof(GetInfracao), new { id = infracao.Idinfracao }, infracao);
               
        }
        //Put para cancelar a multa
        [HttpPut("cancelar-multa")]
        public async Task<IActionResult> CancelarMulta(int idInfracao)
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
            var infracao = await _context.Infracoes.FindAsync(idInfracao);
            if (infracao == null)
            {
                return NotFound("Infração não encontrada.");
            }
            infracao.EstadoInfracao = "Cancelada";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        ///////////
        ///Cliente 
        ///

        [HttpGet("ConsultarMultasCliente")]
        public async Task<IActionResult> ConsultarMultas()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1) // Verifica se é cliente
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

            var infracoes = await _context.Infracoes
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.ClienteIdclienteNavigation)
                .Include(i => i.AluguerIdaluguerNavigation)
                    .ThenInclude(a => a.VeiculoIdveiculoNavigation)
                        .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                            .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Where(i => i.AluguerIdaluguerNavigation.ClienteIdcliente == cliente.Idcliente)
                .ToListAsync();

            if (infracoes == null || !infracoes.Any())
            {
                return NotFound("Sem Infrações.");
            }

            var infracaoDTOs = new List<InfDTO>();

            foreach (var infracao in infracoes)
            {
                var contestacao = await _context.Contestacaos
                    .Where(c => c.InfracoesIdinfracao == infracao.Idinfracao)
                    .Select(c => new
                    {
                        c.Idcontestacao,
                        c.DescContestacao,
                        c.EstadoContestacao
                    })
                    .FirstOrDefaultAsync();

                var dto = new InfDTO
                {
                    DataInicio = infracao.AluguerIdaluguerNavigation?.DataLevantamento,
                    DataDevolucao = infracao.AluguerIdaluguerNavigation?.DataDevolucao,
                    DataInf = infracao.DataInfracao,
                    ValorInf = infracao.ValorInfracao,
                    DescInf = infracao.DescInfracao,
                    EstadoInf = infracao.EstadoInfracao,
                    DataLimPagInf = infracao.DataLimPagInfracoes,
                    Idinf = infracao.Idinfracao,
                    MatriculaVeiculo = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.MatriculaVeiculo,
                    NomeCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.NomeCliente,
                    EmailCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.LoginIdloginNavigation?.Email,
                    NomeMarca = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation?.MarcaVeiculoIdmarcaNavigation?.DescMarca,
                    NomeModelo = infracao.AluguerIdaluguerNavigation?.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation?.DescModelo,
                    NifCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.Nifcliente,
                    TelefoneCliente = infracao.AluguerIdaluguerNavigation?.ClienteIdclienteNavigation?.ContactoC1,
                    IdCont = contestacao?.Idcontestacao ?? 0,
                    EstadoContestacao = contestacao?.EstadoContestacao,
                    DescContestacao = contestacao?.DescContestacao
                };


                infracaoDTOs.Add(dto);
            }

            return Ok(infracaoDTOs);
        }


        //pagar multa como stripe
        [HttpPost("PagarMulta")]
        public async Task<IActionResult> PagarMulta(int idInfracao)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1) // Verifica se é cliente
            {
                return Forbid("Acesso restrito a cliente.");
            }

            var infracao = await _context.Infracoes.FindAsync(idInfracao);
            if (infracao == null)
            {
                return NotFound("Infração não encontrada.");
            }
            if (infracao.EstadoInfracao == "Paga")
            {
                return BadRequest("Esta infração já foi paga.");
            }
            if (infracao.EstadoInfracao == "Contestação Aceite")
            {
                return BadRequest("Esta infração foi contestada! \nEstado da Contestação: Aceite.");
            }
            if (infracao.DataLimPagInfracoes < DateTime.Now)
            {
                return BadRequest("O prazo para pagamento da infração já expirou.");
            }
            infracao.EstadoInfracao = "Aguardando Pagamento";
            await _context.SaveChangesAsync();

            // Aqui você pode adicionar a lógica para processar o pagamento com Stripe
            string frontendBase = _config["Frontend:BaseUrl"];

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(infracao.ValorInfracao * 100), // Stripe espera o valor em centavos
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Pagamento Multa: {infracao.Idinfracao}",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                Metadata = new Dictionary<string, string>
                {
                    { "infracaoId", infracao.Idinfracao.ToString() }
                },
                SuccessUrl = $"{frontendBase}/payment/success/multa?multaId={infracao.Idinfracao}",
                CancelUrl = $"{frontendBase}/payment/failure/multa?multaId={infracao.Idinfracao}",
                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
            };

            var service = new SessionService();
            Session session = service.Create(options);

            return Ok(new
            {
                checkoutUrl = session.Url,
                InfracaoId = infracao.Idinfracao 
            });
        }


        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();
            var webhookSecret = _config["Stripe:WebhookSecret"];
            Event stripeEvent;

            try
            {
                stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    webhookSecret
                );
            }
            catch
            {
                return BadRequest("Invalid webhook signature.");
            }

            // Helper to pull the aluguer ID out of the session metadata
            int? GetInfId(Session session)
            {
                if (session?.Metadata != null
                    && session.Metadata.TryGetValue("infracaoId", out var idStr)
                    && int.TryParse(idStr, out var id))
                {
                    return id;
                }
                return null;
            }

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    {
                        var session = stripeEvent.Data.Object as Session;
                        var infId = GetInfId(session);
                        if (infId.HasValue)
                        {
                            var infracao = await _context.Infracoes
                                .Include(a => a.AluguerIdaluguerNavigation)
                                .FirstOrDefaultAsync(a => a.Idinfracao == infId.Value);
                            var contestacao = await _context.Contestacaos
                                .FirstOrDefaultAsync(c => c.InfracoesIdinfracao == infId.Value);
                            if (infracao != null)
                            {
                                infracao.EstadoInfracao = "Paga";

                                if (contestacao != null)
                                {
                                    contestacao.EstadoContestacao = "Paga";
                                }
                                await _context.SaveChangesAsync();
                            }
                        }
                        break;
                    }

                case "checkout.session.expired":
                case "checkout.session.async_payment_failed":
                case "payment_intent.payment_failed":
                    {
                        // These events all mean the customer did not complete payment
                        // so we should cancel the aluguer and mark the car available again.
                        var session = stripeEvent.Data.Object as Session;
                        var infId = GetInfId(session);
                        if (infId.HasValue)
                        {
                            var infracao = await _context.Infracoes
                                .Include(a => a.AluguerIdaluguerNavigation)
                                .FirstOrDefaultAsync(a => a.Idinfracao == infId.Value);
                            var contestacao = await _context.Contestacaos
                                .FirstOrDefaultAsync(c => c.InfracoesIdinfracao == infId);

                            // safely grab the EstadoContestacao (will be null if contestacao is null)
                            string estado = contestacao?.EstadoContestacao;

                            switch (estado)
                            {
                                case "Negada":
                                    infracao.EstadoInfracao = "Contestação Negada";
                                    break;
                                case "Pendente":
                                    infracao.EstadoInfracao = "Contestada";
                                    break;
                                case null:
                                    infracao.EstadoInfracao = "Submetida";
                                    break;
                                default:
                                    return BadRequest($"Estado da contestação '{estado}' é inválido.");
                            }
                                // Only set the vehicle status back if it was reserved/pending

                            await _context.SaveChangesAsync();
                            
                        }
                        break;
                    }

                default:
                    // Other events you might want to ignore or log
                    break;
            }

            return Ok();
        }

        //put mudar estado
        [HttpPut("mudarEstado")]
        public async Task<IActionResult> MudarEstado(int idInfracao)
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
            var infracao = await _context.Infracoes.FindAsync(idInfracao);
            if (infracao == null)
            {
                return NotFound("Infração não encontrada.");
            }
            var contestacao = await _context.Contestacaos
                .FirstOrDefaultAsync(c => c.InfracoesIdinfracao == idInfracao);

            // safely grab the EstadoContestacao (will be null if contestacao is null)
            string estado = contestacao?.EstadoContestacao;

            switch (estado)
            {
                case "Negada":
                    infracao.EstadoInfracao = "Contestação Negada";
                    break;
                case "Pendente":
                    infracao.EstadoInfracao = "Contestada";
                    break;
                case null:
                    infracao.EstadoInfracao = "Submetida";
                    break;
                default:
                    return BadRequest($"Estado da contestação '{estado}' é inválido.");
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

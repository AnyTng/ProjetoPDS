using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using RESTful_API.Models;
using Stripe;
using Stripe.Checkout;

namespace RESTful_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlugueresController : ControllerBase
    {
        private readonly PdsContext _context;
        private readonly IConfiguration _config;

        public AlugueresController(PdsContext context, IConfiguration config)
        {
            _context = context;
            _config  = config;

            // Carrega a chave secreta Stripe (uma única vez)
            StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
        }

        //------------------------------------------------------------------------
        // GET: api/Alugueres
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluguer>>> GetAluguers()
        {
            return await _context.Aluguers.ToListAsync();
        }

        // GET: api/Alugueres/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Aluguer>> GetAluguer(int id)
        {
            var aluguer = await _context.Aluguers.FindAsync(id);

            if (aluguer == null)
            {
                return NotFound();
            }

            return aluguer;
        }

        // PUT: api/Alugueres/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluguer(int id, Aluguer aluguer)
        {
            if (id != aluguer.Idaluguer)
            {
                return BadRequest();
            }

            _context.Entry(aluguer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AluguerExists(id))
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

        // POST: api/Alugueres
        [HttpPost]
        public async Task<ActionResult<Aluguer>> PostAluguer(Aluguer aluguer)
        {
            _context.Aluguers.Add(aluguer);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAluguer", new { id = aluguer.Idaluguer }, aluguer);
        }

        // DELETE: api/Alugueres/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluguer(int id)
        {
            var aluguer = await _context.Aluguers.FindAsync(id);
            if (aluguer == null)
            {
                return NotFound();
            }

            _context.Aluguers.Remove(aluguer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AluguerExists(int id)
        {
            return _context.Aluguers.Any(e => e.Idaluguer == id);
        }

        //-------------------//
        //Cliente Aluguer
        //-------------------//

        // POST: api/Alugueres/fazaluguer
        [HttpPost("fazaluguer")]
        public async Task<ActionResult<Aluguer>> PostFazAluguer(int idVeiculo, DateTime dataLevantamento, DateTime dataEntrega)
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

            // Encontra cliente associado ao idLogin do token
            int idCliente = await _context.Clientes
                .Where(c => c.LoginIdlogin == userIdLogin)
                .Select(c => c.Idcliente)
                .FirstOrDefaultAsync();

            if (idCliente == 0)
            {
                return NotFound("Cliente não encontrado.");
            }

            // Verifica se o veículo está disponível
            var veiculo = await _context.Veiculos
                .Where(v => v.Idveiculo == idVeiculo && v.EstadoVeiculo == "Disponível")
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                    .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Include(v => v.Aluguers)
                .FirstOrDefaultAsync();

            if (veiculo == null)
            {
                return NotFound("Veículo não disponível ou não encontrado.");
            }

            // Verifica se já existe um aluguer ativo
            var aluguerAtivo = await _context.Aluguers
                .Where(a => a.ClienteIdcliente == idCliente && (a.EstadoAluguer == "Alugado" || a.EstadoAluguer == "Pendente"))
                .FirstOrDefaultAsync();

            if (aluguerAtivo != null)
            {
                return BadRequest("Já existe um aluguer ativo para este cliente.");
            }

            // Calcula o valor do aluguer
            float valorDiario = veiculo.ValorDiarioVeiculo ?? 0;
            int numeroDias = (dataEntrega - dataLevantamento).Days;
            if (numeroDias <= 0)
            {
                return BadRequest("A data de entrega deve ser posterior à data de levantamento.");
            }

            float valorR = valorDiario * numeroDias / 10;
            float valorQ = valorDiario * numeroDias - valorR;

            var novoAluguer = new Aluguer
            {
                VeiculoIdveiculo = idVeiculo,
                ClienteIdcliente = idCliente,
                DataLevantamento = dataLevantamento,
                DataEntregaPrevista = dataEntrega,
                EstadoAluguer = "Pendente",
                ValorReserva = valorR,
                ValorQuitacao = valorQ,
                DataDevolucao = null,
                DataFatura = null,
                Classificacao = null
            };

            _context.Aluguers.Add(novoAluguer);
            await _context.SaveChangesAsync(); // Salva para obter o ID

            // URL base do frontend a partir do appsettings
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
                            UnitAmount = (long)(valorR * 100), // Stripe espera o valor em centavos
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Reserva de aluguer: {veiculo.ModeloVeiculoIdmodeloNavigation.DescModelo}",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                Metadata = new Dictionary<string, string>
                {
                    { "aluguerId", novoAluguer.Idaluguer.ToString() }
                },
                SuccessUrl = $"{frontendBase}/payment/success?aluguerId={novoAluguer.Idaluguer}",
                CancelUrl = $"{frontendBase}/payment/failure?aluguerId={novoAluguer.Idaluguer}",
                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
            };

            var service = new SessionService();
            Session session = service.Create(options);

            return Ok(new
            {
                checkoutUrl = session.Url,
                aluguerId = novoAluguer.Idaluguer
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
            int? GetAluguerId(Session session)
            {
                if (session?.Metadata != null
                    && session.Metadata.TryGetValue("aluguerId", out var idStr)
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
                    var aluguerId = GetAluguerId(session);
                    if (aluguerId.HasValue)
                    {
                        var aluguer = await _context.Aluguers
                            .Include(a => a.VeiculoIdveiculoNavigation)
                            .FirstOrDefaultAsync(a => a.Idaluguer == aluguerId.Value);

                        if (aluguer != null)
                        {
                            aluguer.EstadoAluguer = "Aguarda levantamento";
                            aluguer.VeiculoIdveiculoNavigation.EstadoVeiculo = "Alugado";
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
                    var aluguerId = GetAluguerId(session);
                    if (aluguerId.HasValue)
                    {
                        var aluguer = await _context.Aluguers
                            .Include(a => a.VeiculoIdveiculoNavigation)
                            .FirstOrDefaultAsync(a => a.Idaluguer == aluguerId.Value);

                        if (aluguer != null)
                        {
                            aluguer.EstadoAluguer = "Cancelado";
                            // Only set the vehicle status back if it was reserved/pending
                            if (aluguer.VeiculoIdveiculoNavigation != null)
                            {
                                aluguer.VeiculoIdveiculoNavigation.EstadoVeiculo = "Disponível";
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                    break;
                }

                default:
                    // Other events you might want to ignore or log
                    break;
            }

            return Ok();
        }

        [HttpPut("cancelar")]
        public async Task<IActionResult> PutCancelarAluguer(int idAluguer)
        {
            // 1) Parse user info from token
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim   = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin)
                || !int.TryParse(roleIdClaim,   out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }

            // 2) Only clients (roleId == 1) may cancel
            if (userTipoLogin != 1)
            {
                return Forbid("Acesso restrito a cliente.");
            }

            // 3) Load the rental together with its vehicle
            var aluguer = await _context.Aluguers
                .Include(a => a.VeiculoIdveiculoNavigation)
                .FirstOrDefaultAsync(a => a.Idaluguer == idAluguer);

            if (aluguer == null)
                return NotFound("Aluguer não encontrado.");

            // 4) Ensure the logged-in cliente owns this rental
            /*if (aluguer. != userIdLogin)
                return Forbid("Você não pode cancelar este aluguer.");*/

            // 5) Only pending or “aguarda levantamento” rentals can be cancelled
            if (aluguer.EstadoAluguer != "Pendente"
                && aluguer.EstadoAluguer != "Aguarda levantamento")
            {
                return BadRequest("Aluguer não se encontra ativo para cancelamento.");
            }

            // 6) Perform cancellation
            aluguer.EstadoAluguer = "Cancelado";
            aluguer.VeiculoIdveiculoNavigation.EstadoVeiculo = "Disponível";

            // 7) Save changes (EF will track both updates automatically)
            await _context.SaveChangesAsync();

            return Ok();
        }

        //-------------------//
        //Admin Aluguer
        //-------------------//

        [HttpGet("pesquisapedido")]
        public async Task<IActionResult> GetPesquisaPedido() //filtragem feita no frontend
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) //verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }

            var alugueres = await _context.Aluguers
                .Include(a => a.ClienteIdclienteNavigation)
                .Include(a => a.VeiculoIdveiculoNavigation)
                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .ToListAsync();
            if (alugueres == null || alugueres.Count == 0)
            {
                return NotFound("Nenhum aluguer encontrado.");
            }
            return Ok(alugueres.Select(a => new
            {
                a.Idaluguer,
                Cliente = new
                {
                    a.ClienteIdclienteNavigation.NomeCliente,
                    a.ClienteIdclienteNavigation.ContactoC1,
                    a.ClienteIdclienteNavigation.Nifcliente
                },
                Veiculo = new
                {
                    a.VeiculoIdveiculoNavigation.MatriculaVeiculo,
                    Marca = a.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                    Modelo = a.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.DescModelo
                },
                a.DataLevantamento,
                a.DataEntregaPrevista,
                a.EstadoAluguer,
                a.ValorReserva,
                a.ValorQuitacao
            }));
        }

        [HttpPut("atualizaestado")]
        public async Task<IActionResult> PutAtualizaEstadoAluguer(int id, string estadoAluguer)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) //verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }

            var aluguer = await _context.Aluguers.FindAsync(id);
            if (aluguer == null)
            {
                return NotFound("Aluguer não encontrado.");
            }

            if (estadoAluguer == "Alugado" || estadoAluguer == "Cancelado")
            {
                aluguer.EstadoAluguer = estadoAluguer;
            }
            else
            {
                return NotFound("Estado de aluguer falho.");
            }

            _context.Entry(aluguer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("entrega")]
        public async Task<IActionResult> PutEntregaAluguer(int idAluguer)
        {
            DateTime dataDevolucao = DateTime.Now;

            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) //verifica se é admin
            {
                return Forbid("Acesso restrito a admin.");
            }
            var aluguer = await _context.Aluguers.FindAsync(idAluguer);
            if (aluguer == null)
            {
                return NotFound("Aluguer não encontrado.");
            }
            if (aluguer.EstadoAluguer != "Alugado")
            {
                return NotFound("Aluguer não se encontra ativo.");
            }

            aluguer.DataDevolucao = dataDevolucao;
            aluguer.EstadoAluguer = "Concluido";
            aluguer.DataFatura = dataDevolucao;

            var veiculo = await _context.Veiculos
                .FirstOrDefaultAsync(v => v.Idveiculo == aluguer.VeiculoIdveiculo);
            veiculo.EstadoVeiculo= "Disponível";

            _context.Entry(aluguer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok();
        }

        //--------------------//
        //cliente avalia historico aluguer
        //--------------------//
        [HttpGet("historico")]
        public async Task<IActionResult> historicoAluguer()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1) //verifica se é cliente
            {
                return Forbid("Acesso restrito a cliente.");
            }

            int idCliente = await _context.Clientes
                .Where(c => c.LoginIdlogin == userIdLogin)
                .Select(c => c.Idcliente)
                .FirstOrDefaultAsync();

            if (idCliente == 0)
            {
                return NotFound("Cliente não encontrado.");
            }

            var alugueres = await _context.Aluguers
                .Where(a => a.ClienteIdcliente == idCliente)
                .Include(a => a.ClienteIdclienteNavigation)
                .Include(a => a.VeiculoIdveiculoNavigation)
                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .ToListAsync();

            // if (alugueres == null || alugueres.Count == 0)
            // {
            //     return NotFound("Nenhum aluguer encontrado.");
            // }
            return Ok(alugueres.Select(a => new
            {
                a.Idaluguer,
                Cliente = new
                {
                    a.ClienteIdclienteNavigation.NomeCliente,
                    a.ClienteIdclienteNavigation.ContactoC1,
                    a.ClienteIdclienteNavigation.Nifcliente
                },
                Veiculo = new
                {
                    a.VeiculoIdveiculoNavigation.MatriculaVeiculo,
                    Marca = a.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                    Modelo = a.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.DescModelo
                },
                a.DataLevantamento,
                a.DataEntregaPrevista,
                a.EstadoAluguer,
                a.ValorReserva,
                a.ValorQuitacao,
                a.DataDevolucao,
                a.DataFatura,
                a.Classificacao
            }));
        }

        [HttpPut("avaliacao")]
        public async Task<IActionResult> PutAvaliaAluguer(int idAluguer, int classificacao)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1) //verifica se é cliente
            {
                return Forbid("Acesso restrito a cliente.");
            }

            var aluguer = await _context.Aluguers.FindAsync(idAluguer);
            if (aluguer == null)
            {
                return NotFound("Aluguer não encontrado.");
            }

            if (aluguer.EstadoAluguer != "Concluido")
            {
                return NotFound("Aluguer não concluido, apenas sera permitida a sua avaliação apos a entrega do veiculo.");
            }

            if (classificacao > 5 || classificacao < 0)
            {
                return NotFound("Classificação deve estar entre 0 e 5");
            }

            aluguer.Classificacao = classificacao;
            _context.Entry(aluguer).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }



        //--------------------//
        //Fatura (PDF)
        //--------------------//
        [HttpGet("fatura")]
        public async Task<IActionResult> GetFaturaAluguer(int idAluguer)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }

            if (userTipoLogin != 1 && userTipoLogin != 3)
            {
                return Forbid("Acesso restrito.");
            }

            var aluguer = await _context.Aluguers
                .Where(a => a.Idaluguer == idAluguer)
                .Include(a => a.ClienteIdclienteNavigation)
                .Include(a => a.VeiculoIdveiculoNavigation)
                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .FirstOrDefaultAsync();

            if (aluguer == null || aluguer.EstadoAluguer != "Concluido")
            {
                return NotFound("Aluguer não encontrado.");
            }

            var pdfBytes = GeneratePdfFatura(aluguer);
            return File(pdfBytes, "application/pdf", $"fatura_{idAluguer}.pdf");
        }

        private byte[] GeneratePdfFatura(Aluguer aluguer)
        {
            using var stream = new MemoryStream();

            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.MarginTop(1, Unit.Centimetre);
                    page.MarginBottom(2, Unit.Centimetre);
                    page.MarginLeft(2, Unit.Centimetre);
                    page.MarginRight(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header().Column(header =>
                    {
                        header.Item().AlignRight().Width(70).Image("assets/logo.png", ImageScaling.FitWidth);
                        header.Item().Text("Fatura de Aluguer").FontSize(20).Bold().AlignCenter();
                    });

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Text("\nDados Empresa:").AlignCenter().Bold();

                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Empresa:").SemiBold();
                            row.RelativeColumn(3).Text("CarExpress, Lda").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Contacto:").SemiBold();
                            row.RelativeColumn(3).Text("963 183 446").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("E-mail:").SemiBold();
                            row.RelativeColumn(3).Text("geral@carexpress.pt").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Morada:").SemiBold();
                            row.RelativeColumn(3).Text("Rua das Ameixas, Nº54").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Código Postal:").SemiBold();
                            row.RelativeColumn(3).Text("1234-567, Frossos, Braga").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Capital Social:").SemiBold();
                            row.RelativeColumn(3).Text("20 000€").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Cont.:").SemiBold();
                            row.RelativeColumn(3).Text("500400300").FontColor(Colors.Grey.Darken2);
                        });

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken2);

                        col.Item().Text("\nDados Cliente:").AlignCenter().Bold();

                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Data:").SemiBold();
                            row.RelativeColumn(3).Text($"{aluguer.DataFatura:d}").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Cliente:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.ClienteIdclienteNavigation.NomeCliente).FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Contacto:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.ClienteIdclienteNavigation.ContactoC1).FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("NIF:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.ClienteIdclienteNavigation.Nifcliente).FontColor(Colors.Grey.Darken2);
                        });

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken2);

                        col.Item().Text("\nDados Veículo:").AlignCenter().Bold();

                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Veículo:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.VeiculoIdveiculoNavigation.MatriculaVeiculo).FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Marca:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca).FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Modelo:").SemiBold();
                            row.RelativeColumn(3).Text(aluguer.VeiculoIdveiculoNavigation.ModeloVeiculoIdmodeloNavigation.DescModelo);
                        });

                        col.Item().LineHorizontal(1).LineColor(Colors.Grey.Darken2);

                        col.Item().Text("\nDados Pagamento:").AlignCenter().Bold();

                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("IVA (23%):").SemiBold();
                            row.RelativeColumn(3).Text("Incluído nos valores");
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Valor Reserva:").SemiBold();
                            row.RelativeColumn(3).Text($"{aluguer.ValorReserva:C}").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Valor Quitação:").SemiBold();
                            row.RelativeColumn(3).Text($"{aluguer.ValorQuitacao:C}").FontColor(Colors.Grey.Darken2);
                        });
                        col.Item().Row(row =>
                        {
                            row.RelativeColumn(1).Text("Total:").Bold();
                            row.RelativeColumn(3).Text($"{(aluguer.ValorReserva + aluguer.ValorQuitacao):C}").Bold();
                        });
                    });

                    page.Footer().Column(column =>
                    {
                        column.Item().AlignCenter().Text("Obrigado por utilizar nossos serviços.").Bold();

                        column.Item().AlignRight().Text(txt =>
                        {
                            txt.DefaultTextStyle(x => x.FontSize(8));

                            txt.Span("Página ");
                            txt.CurrentPageNumber();
                            txt.Span(" de ");
                            txt.TotalPages();
                        });

                    });
                });
            })
            .GeneratePdf(stream);

            return stream.ToArray();
        }
    }
}
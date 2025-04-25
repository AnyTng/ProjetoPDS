using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    public class InfracaoDTO
    {
        public int Idinfracao { get; set; }
        public DateTime? DataInfracao { get; set; }
        public double? ValorInfracao { get; set; }
        public string? DescInfracao { get; set; }
        public string? EstadoInfracao { get; set; }
        public DateTime? DataLimPagInfracoes { get; set; }
    }


    public class AluguerDTO
    {
        public int Idaluguer { get; set; }
        public DateTime? DataLevantamento { get; set; }
        public DateTime? DataDevolucao { get; set; }
        public string MatriculaVeiculo { get; set; } = string.Empty;
        public string ModeloVeiculo { get; set; } = string.Empty;
        public string MarcaVeiculo { get; set; } = string.Empty;
        public string? NomeCliente { get; set; } = string.Empty;
        public string? Contacto1 { get; set; } = string.Empty;
        public int? Nif { get; set; } 
    }

    public class NotificacaoDTO
    {
        public int Idnotif { get; set; }
        public int LoginIdlogin { get; set; }
        public int TipoNotificacao { get; set; }
        public int? IdInfracao { get; set; }
        public int? IdAluguer { get; set; }
        public InfracaoDTO? Infracao { get; set; }
        public AluguerDTO? Aluguer { get; set; }

    }





    [Route("api/[controller]")]
    [ApiController]
    public class NotificacoesController : ControllerBase
    {
        private readonly PdsContext _context;

        public NotificacoesController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Notificacoes    
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificacaoDTO>>> GetNotificacaos()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");

            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
                return Unauthorized("Token inválido.");

            if (userTipoLogin != 1)
                return Forbid("Acesso restrito a clientes.");

            var notificacoes = await _context.Notificacaos
                .Where(n => n.LoginIdlogin == userIdLogin)
                .ToListAsync();

            if (notificacoes == null || notificacoes.Count == 0)
                return NotFound("Não existem notificações para o utilizador.");

            var notificacoesDto = new List<NotificacaoDTO>();

            foreach (var n in notificacoes)
            {
                int? idInfracao = null;
                int? idAluguer = null;

                // Extrai os IDs do conteúdo JSON
                if (!string.IsNullOrEmpty(n.ConteudoNotif))
                {
                    try
                    {
                        using var doc = JsonDocument.Parse(n.ConteudoNotif);
                        var root = doc.RootElement;

                        if (root.TryGetProperty("idInfracao", out var idInf))
                            idInfracao = idInf.GetInt32();

                        if (root.TryGetProperty("Idaluguer", out var idAlg))
                            idAluguer = idAlg.GetInt32();
                    }
                    catch
                    {
                        // Ignorar ou logar erro de parsing
                    }
                }

                // Busca dados da infração
                InfracaoDTO? infracaoDto = null;
                if (idInfracao.HasValue)
                {
                    var infracao = await _context.Infracoes.FindAsync(idInfracao.Value);
                    if (infracao != null)
                    {
                        infracaoDto = new InfracaoDTO
                        {
                            Idinfracao = infracao.Idinfracao,
                            DataInfracao = infracao.DataInfracao, // DateTime (assume que nunca será nulo)
                            ValorInfracao = (float)infracao.ValorInfracao, // <- Cast resolvendo o erro
                            DescInfracao = infracao.DescInfracao ?? string.Empty,
                            EstadoInfracao = infracao.EstadoInfracao ?? "Desconhecido",
                            DataLimPagInfracoes = infracao.DataLimPagInfracoes
                        };
                    }

                }

                // Busca dados do aluguer
                AluguerDTO? aluguerDto = null;
                if (idAluguer.HasValue)
                {
                    var aluguer = await _context.Aluguers
                        .Include(a => a.VeiculoIdveiculoNavigation)
                            .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                                .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                        .Include(a => a.ClienteIdclienteNavigation)
                        .FirstOrDefaultAsync(a => a.Idaluguer == idAluguer.Value);

                    if (aluguer != null)
                    {
                        aluguerDto = new AluguerDTO
                        {
                            Idaluguer = aluguer.Idaluguer,
                            DataLevantamento = aluguer.DataLevantamento,
                            DataDevolucao = aluguer.DataDevolucao,
                            MatriculaVeiculo = aluguer.VeiculoIdveiculoNavigation?.MatriculaVeiculo ?? "Desconhecida",
                            ModeloVeiculo = aluguer.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation.DescModelo?? "Desconhecida",
                            MarcaVeiculo = aluguer.VeiculoIdveiculoNavigation?.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca ?? "Desconhecida",
                            NomeCliente = aluguer.ClienteIdclienteNavigation?.NomeCliente ?? "Desconhecido",
                            Contacto1 = aluguer.ClienteIdclienteNavigation?.ContactoC1.ToString() ?? "Desconhecido",
                            Nif = aluguer.ClienteIdclienteNavigation?.Nifcliente

                        };
                    }
                }

                // Adiciona ao resultado final
                notificacoesDto.Add(new NotificacaoDTO
                {
                    Idnotif = n.Idnotif,
                    LoginIdlogin = n.LoginIdlogin,
                    TipoNotificacao = n.TipoNotificacao,
                    IdInfracao = idInfracao,
                    IdAluguer = idAluguer,
                    Infracao = infracaoDto,
                    Aluguer = aluguerDto
                });
            }

            return Ok(notificacoesDto);
        }




        // GET: api/Notificacoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Notificacao>> GetNotificacao(int id)
        {
            var notificacao = await _context.Notificacaos.FindAsync(id);

            if (notificacao == null)
            {
                return NotFound();
            }

            return notificacao;
        }

        // PUT: api/Notificacoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotificacao(int id, Notificacao notificacao)
        {
            if (id != notificacao.Idnotif)
            {
                return BadRequest();
            }

            _context.Entry(notificacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NotificacaoExists(id))
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

        // POST: api/Notificacoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Notificacao>> PostNotificacao(Notificacao notificacao)
        {
            _context.Notificacaos.Add(notificacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNotificacao", new { id = notificacao.Idnotif }, notificacao);
        }

        // DELETE: api/Notificacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotificacao(int id)
        {
            var notificacao = await _context.Notificacaos.FindAsync(id);
            if (notificacao == null)
            {
                return NotFound();
            }

            _context.Notificacaos.Remove(notificacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NotificacaoExists(int id)
        {
            return _context.Notificacaos.Any(e => e.Idnotif == id);
        }
    }
}

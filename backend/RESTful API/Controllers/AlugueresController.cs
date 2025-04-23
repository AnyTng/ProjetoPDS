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
    public class AlugueresController : ControllerBase
    {
        private readonly PdsContext _context;

        public AlugueresController(PdsContext context)
        {
            _context = context;
        }

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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
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
        [HttpGet("apresentaValor")]
        public async Task<ActionResult<Aluguer>> GetApresentaValorAluguer(int idVeiculo, DateTime dataLevantamento, DateTime dataEntrega)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 1)//verifica se é cliente
            {
                return Forbid("Acesso restrito a cliente.");
            }

            // Encontra cliente associado ao idLogin do token
            int idCliente = 0;
            idCliente = await _context.Clientes
                .Where(c => c.LoginIdlogin == userIdLogin)
                .Select(c => c.Idcliente)
                .FirstOrDefaultAsync();

            if (idCliente == 0)
            {
                return NotFound("Cliente não encontrado.");
            }
            var veiculo = await _context.Veiculos
                .Where(v => v.Idveiculo == idVeiculo && v.EstadoVeiculo == "Disponivel")
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                    .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Include(v => v.Aluguers)
                .FirstOrDefaultAsync();

            if (veiculo == null)
            {
                return NotFound("Veículo não disponível ou não encontrado.");
            }
            float valorDiario = veiculo.ValorDiarioVeiculo ?? 0;
            int numeroDias = (dataEntrega - dataLevantamento).Days;
            if (numeroDias <= 0)
            {
                return BadRequest("A data de entrega deve ser posterior à data de levantamento.");
            }
            float valorR = valorDiario * numeroDias / 10;
            float valorQ = valorDiario * numeroDias - valorR;

            //retorna o valor total do aluguer, o valor de reserva e o valor de quitação
            return Ok(new
            {
                ValorTotal = valorR + valorQ,
                ValorReserva = valorR,
                ValorQuitacao = valorQ
            });
        }

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
            if (userTipoLogin != 1)//verifica se é cliente
            {
                return Forbid("Acesso restrito a cliente.");
            }

            // Encontra cliente associado ao idLogin do token
            int idCliente = 0;
            idCliente = await _context.Clientes
                .Where(c => c.LoginIdlogin == userIdLogin)
                .Select(c => c.Idcliente)
                .FirstOrDefaultAsync();

            if (idCliente == 0)
            {
                return NotFound("Cliente não encontrado.");
            }

            // Verifica se o veículo está disponível
            var veiculo = await _context.Veiculos
                .Where(v => v.Idveiculo == idVeiculo && v.EstadoVeiculo == "Disponivel")
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                    .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Include(v => v.Aluguers)
                .FirstOrDefaultAsync();
            if (veiculo == null)
            {
                return NotFound("Veículo não disponível ou não encontrado.");
            }

            var aluguerAtivo = await _context.Aluguers
                .Where(a => a.ClienteIdcliente == idCliente && a.EstadoAluguer == "Ativo")
                .FirstOrDefaultAsync();
            if (aluguerAtivo != null)
            {
                return BadRequest("Já existe um aluguer ativo para este cliente.");
            }

            float valorDiario = veiculo.ValorDiarioVeiculo ?? 0;
            int numeroDias = (dataEntrega - dataLevantamento).Days;
            if (numeroDias <= 0)
            {
                return BadRequest("A data de entrega deve ser posterior à data de levantamento.");
            }
            float valorR = valorDiario * numeroDias / 10;
            float valorQ = valorDiario * numeroDias - valorR;

            // Cria novo aluguer
            var novoAluguer = new Aluguer
            {
                VeiculoIdveiculo = idVeiculo,
                ClienteIdcliente = idCliente,
                DataLevantamento = dataLevantamento,
                DataEntregaPrevista = dataEntrega,
                EstadoAluguer = "Esperando Levantamento",
                ValorReserva = valorR,
                ValorQuitacao = valorQ,
                DataDevolucao = null,
                DataFatura = null,
                Classificacao = null
            };
            
            _context.Aluguers.Add(novoAluguer);
            await _context.SaveChangesAsync();
            // Atualiza o estado do veículo para "Indisponível"
            veiculo.EstadoVeiculo = "Indisponivel";
            _context.Entry(veiculo).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // Retorna o aluguer criado
            return CreatedAtAction("GetAluguer", new { id = novoAluguer.Idaluguer }, novoAluguer);

        }


        //-------------------//
        //Admin Aluguer
        //-------------------//


        [HttpGet("pesquisapedido")]
        public async Task<IActionResult> GetPesquisaPedido()//filtragem feita no frontend
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

            // Obter todos os alugueres com os detalhes do cliente e veículo
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
            // Retornar a lista de alugueres
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

        

    }
}

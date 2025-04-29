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
    public class DespesasController : ControllerBase
    {
        private readonly PdsContext _context;

        public DespesasController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Despesas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Despesa>>> GetDespesas()
        {
            return await _context.Despesas.ToListAsync();
        }

        // GET: api/Despesas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Despesa>> GetDespesa(int id)
        {
            var despesa = await _context.Despesas.FindAsync(id);

            if (despesa == null)
            {
                return NotFound();
            }

            return despesa;
        }

        // PUT: api/Despesas/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDespesa(int id, Despesa despesa)
        {
            if (id != despesa.Iddespesa)
            {
                return BadRequest();
            }

            _context.Entry(despesa).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DespesaExists(id))
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

        // POST: api/Despesas
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Despesa>> PostDespesa(Despesa despesa)
        {
            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetDespesa", new { id = despesa.Iddespesa }, despesa);
        }

        // DELETE: api/Despesas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDespesa(int id)
        {
            var despesa = await _context.Despesas.FindAsync(id);
            if (despesa == null)
            {
                return NotFound();
            }

            _context.Despesas.Remove(despesa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DespesaExists(int id)
        {
            return _context.Despesas.Any(e => e.Iddespesa == id);
        }

        //////////
        //Despesas por admin

        //Ver todos os concursos
        [HttpGet("Concursos")]
        public async Task<ActionResult<IEnumerable<Despesa>>> GetConcursos()
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Administrador.");
            }
            return await _context.Despesas
                .Include(d => d.VeiculoIdveiculoNavigation)
                    .ThenInclude(v => v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                        .ToListAsync();
        }


        //Criar Concurso
        [HttpPost("CriarConcurso")]
        public async Task<ActionResult<Despesa>> CriarConcurso(string matricula, string descDesp)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var veiculo = _context.Veiculos.FirstOrDefault(v => v.MatriculaVeiculo == matricula);
            if (veiculo == null)
            {
                return NotFound("Veículo não encontrado.");
            }
            if(veiculo.EstadoVeiculo != "Disponível")
            {
                return BadRequest("O veículo não está disponivel para manutenção.");
            }

            var despesa = new Despesa
            {
                DescConcurso = descDesp,
                DataInicio = DateTime.Now,
                EstadoConcurso = "Ativo",
                VeiculoIdveiculoNavigation = veiculo
            };

            veiculo.EstadoVeiculo = "Avariado";

            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetDespesa", new { id = despesa.Iddespesa }, despesa);
        }

        //cancelar concurso e manutençoes associadas
        [HttpPut("CancelarConcurso")]
        public async Task<IActionResult> CancelarConcurso(int id)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var despesa = await _context.Despesas.FindAsync(id);
            if (despesa == null)
            {
                return NotFound();
            }


            despesa.EstadoConcurso = "Cancelado";
            _context.Entry(despesa).State = EntityState.Modified;

            // Cancelar todas manutenções associadas
            var manutencoes = await _context.Manutencaos
                .Where(m => m.DespesaIddespesa == despesa.Iddespesa)
                .ToListAsync();
            foreach (var manutencao in manutencoes)
            {
                manutencao.EstadoProposta = "Cancelada";
                _context.Entry(manutencao).State = EntityState.Modified;
            }



            await _context.SaveChangesAsync();
            return NoContent();
        }
        ///////
        /// 
        [HttpPut("TerminoConcurso")]
        public async Task<IActionResult> TerminoConcurso(int id)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 3) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Administrador.");
            }

            var despesa = await _context.Despesas.FindAsync(id);
            if (despesa == null)
            {
                return NotFound();
            }


            despesa.EstadoConcurso = "Concluido";
            despesa.DataFim = DateTime.Now;
            _context.Entry(despesa).State = EntityState.Modified;

            // Estado veiculo muda para disponivel
            var veiculo = await _context.Veiculos.FindAsync(despesa.VeiculoIdveiculo);
            if (veiculo != null)
            {
                veiculo.EstadoVeiculo = "Disponível";
                _context.Entry(veiculo).State = EntityState.Modified;
            }



            await _context.SaveChangesAsync();
            return NoContent();
        }



        //////////
        //Despesas por Empresa

        //Ver todos os concursos
        [HttpGet("ConcursosAtivos")]
        public async Task<ActionResult<IEnumerable<Despesa>>> GetConcursosAtivos()
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



            // Buscar despesas ativas ou relacionadas às manutenções da empresa
            var despesas = await _context.Despesas
                .Include(d=>d.VeiculoIdveiculoNavigation)
                    .ThenInclude(v=>v.ModeloVeiculoIdmodeloNavigation)
                        .ThenInclude(m=>m.MarcaVeiculoIdmarcaNavigation)
                .Where(d => d.EstadoConcurso == "Ativo")
                .ToListAsync();

            return despesas;
        }

        //submeter Fatura recebe pdf
        [HttpPut("SubmeterFatura")]
        public async Task<IActionResult> SubmeterFatura(int idConcurso, IFormFile pdf)
        {
            var idLoginClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roleIdClaim = User.FindFirstValue("roleId");
            if (!int.TryParse(idLoginClaim, out int userIdLogin) || !int.TryParse(roleIdClaim, out int userTipoLogin))
            {
                return Unauthorized("Token inválido.");
            }
            if (userTipoLogin != 2) // Verifica se é administrador
            {
                return Forbid("Acesso restrito a Empresas.");
            }
            var despesa = await _context.Despesas.FindAsync(idConcurso);
            if (despesa == null)
            {
                return NotFound();
            }
            string absPath = (""+idConcurso);
            string? oldPdfPath = despesa.CaminhoFaturaPDF;
            string? newPDFRelativePath = null;
            string idC = despesa.Iddespesa.ToString();
            if (pdf != null)
            {


                // Garante que a matrícula a usar no caminho existe
                var idPDFParaPasta = !string.IsNullOrWhiteSpace(idC)
                    ? idC
                    : absPath;

                if (string.IsNullOrWhiteSpace(idPDFParaPasta))
                {
                    return BadRequest("O ID do cliente é necessário para guardar a imagem.");
                }


                // Nome seguro do ficheiro
                var fileName = Path.GetFileName(pdf.FileName);
                // Cria um nome único para evitar conflitos e potenciais problemas de segurança
                var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

                var relativeFolderPath = Path.Combine("assets/pdfManut", idPDFParaPasta);
                var absoluteFolderPath = Path.Combine(Directory.GetCurrentDirectory(), relativeFolderPath);

                if (!Directory.Exists(absoluteFolderPath))
                {
                    Directory.CreateDirectory(absoluteFolderPath);
                }

                var absoluteFilePath = Path.Combine(absoluteFolderPath, uniqueFileName);

                try
                {
                    using (var stream = new FileStream(absoluteFilePath, FileMode.Create))
                    {
                        await pdf.CopyToAsync(stream);
                    }

                    // Guarda o caminho relativo para a base de dados
                    newPDFRelativePath = Path.Combine(relativeFolderPath, uniqueFileName)
                        .Replace(Path.DirectorySeparatorChar, '/'); // Normalizar para URL
                }
                catch (Exception ex)
                {
                    // Log do erro seria útil aqui
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        $"Erro ao guardar a imagem: {ex.Message}");
                }
            }
            // Se já existia um PDF, apaga-o
            if (!string.IsNullOrWhiteSpace(oldPdfPath))
            {
                var oldAbsolutePath = Path.Combine(Directory.GetCurrentDirectory(), oldPdfPath);
                if (System.IO.File.Exists(oldAbsolutePath))
                {
                    try
                    {
                        System.IO.File.Delete(oldAbsolutePath);
                    }
                    catch (Exception ex)
                    {
                        // Log do erro seria útil aqui
                        return StatusCode(StatusCodes.Status500InternalServerError,
                            $"Erro ao apagar o PDF antigo: {ex.Message}");
                    }
                }
            }
            despesa.EstadoConcurso = "Fatura Submetida";
            despesa.CaminhoFaturaPDF = newPDFRelativePath;
            _context.Entry(despesa).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("DownloadFatura/{idConcurso}")]
        public async Task<IActionResult> DownloadFatura(int idConcurso)
        {
            var despesa = await _context.Despesas.FindAsync(idConcurso);
            if (despesa == null || string.IsNullOrEmpty(despesa.CaminhoFaturaPDF))
            {
                return NotFound("Fatura não encontrada.");
            }

            var absoluteFilePath = Path.Combine(Directory.GetCurrentDirectory(), despesa.CaminhoFaturaPDF.Replace('/', Path.DirectorySeparatorChar));

            if (!System.IO.File.Exists(absoluteFilePath))
            {
                return NotFound("Ficheiro não encontrado.");
            }

            var memory = new MemoryStream();
            using (var stream = new FileStream(absoluteFilePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, "application/pdf", Path.GetFileName(absoluteFilePath));
        }
    }
}

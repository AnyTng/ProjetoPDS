using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RESTful_API.Models;

namespace RESTful_API.Controllers
{
    // DTO permanece o mesmo

    public class VeiculoCreateDTO
    {
        // --- campos obrigatórios ---
        public string MatriculaVeiculo { get; set; } = null!;
        public int ModeloVeiculoIdmodelo { get; set; }
        public int? MarcaVeiculoIdmarca { get; set; } // chega via navegação do modelo, mas podes receber

        // --- opcionais ---
        public int? LotacaoVeiculo { get; set; }
        public int? TaraVeiculo { get; set; }
        public string? DescCor { get; set; }
        public DateTime? DataLegal { get; set; }
        public DateTime DataFabricacao { get; set; }
        public DateTime DataAquisicao { get; set; }
        public float? ValorDiarioVeiculo { get; set; }
        public string? DescVeiculo { get; set; }
        public string? EstadoVeiculo { get; set; }

        // --- ficheiro ---
        public IFormFile? ImagemVeiculo { get; set; }
    }

    public class VeiculoEditDTO
    {
        public int Idveiculo { get; set; }
        public string? MatriculaVeiculo { get; set; }
        public int? LotacaoVeiculo { get; set; }
        public int? TaraVeiculo { get; set; }
        public string? DescCor { get; set; }
        public DateTime? DataLegal { get; set; }
        public DateTime? DataFabricacao { get; set; }
        public DateTime? DataAquisicao { get; set; }
        public float? ValorDiarioVeiculo { get; set; }

        public string? CaminhoFotoVeiculo { get; set; }
        public string? ImagemBase64 { get; set; }

        public int ModeloVeiculoIdmodelo { get; set; }
        public int MarcaVeiculoIdmarca { get; set; }
        public string? DescModelo { get; set; }
        public string? DescMarca { get; set; }

        public string? DescVeiculo { get; set; }
        public string? EstadoVeiculo { get; set; }
        public IFormFile? ImagemVeiculo { get; set; }
    }

    public class ClienteVeiculoDTO
    {
        public int Idveiculo { get; set; }
        public string? MatriculaVeiculo { get; set; }
        public int? LotacaoVeiculo { get; set; }
        public int? TaraVeiculo { get; set; }
        public string? DescCor { get; set; }
        public DateTime? DataLegal { get; set; }
        public DateTime? DataFabricacao { get; set; }
        public DateTime? DataAquisicao { get; set; }
        public float? ValorDiarioVeiculo { get; set; }

        public string? CaminhoFotoVeiculo { get; set; }
        public string? ImagemBase64 { get; set; }

        public int ModeloVeiculoIdmodelo { get; set; }
        public int MarcaVeiculoIdmarca { get; set; }
        public string? DescModelo { get; set; }
        public string? DescMarca { get; set; }

        public string? DescVeiculo { get; set; }
        public string? EstadoVeiculo { get; set; }

        public float? Avaliacao { get; set; } // Adicionado para incluir a avaliação do veículo
    }


    [Route("api/[controller]")]
    [ApiController]
    public class VeiculosController : ControllerBase
    {
        private readonly PdsContext _context;

        public VeiculosController(PdsContext context)
        {
            _context = context;
        }

        // GET: api/Veiculos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VeiculoEditDTO>>> GetVeiculos()
        {
            var veiculos = await _context.Veiculos
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .ToListAsync();

            var listaDTO = new List<VeiculoEditDTO>();
            foreach (var v in veiculos)
            {
                string? imagemBase64 = null;
                if (!string.IsNullOrEmpty(v.CaminhoFotoVeiculo))
                {
                    var abs = Path.Combine(Directory.GetCurrentDirectory(),
                        v.CaminhoFotoVeiculo.Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(abs))
                    {
                        var bytes = await System.IO.File.ReadAllBytesAsync(abs);
                        var ext = Path.GetExtension(abs).TrimStart('.');
                        imagemBase64 = $"data:image/{ext};base64,{Convert.ToBase64String(bytes)}";
                    }
                }



                listaDTO.Add(new VeiculoEditDTO
                {
                    Idveiculo = v.Idveiculo,
                    MatriculaVeiculo = v.MatriculaVeiculo,
                    LotacaoVeiculo = v.LotacaoVeiculo,
                    TaraVeiculo = v.TaraVeiculo,
                    DescCor = v.DescCor,
                    DataLegal = v.DataLegal,
                    DataFabricacao = v.DataFabricacao,
                    DataAquisicao = v.DataAquisicao,
                    ValorDiarioVeiculo = v.ValorDiarioVeiculo,
                    CaminhoFotoVeiculo = v.CaminhoFotoVeiculo,
                    ImagemBase64 = imagemBase64,
                    ModeloVeiculoIdmodelo = v.ModeloVeiculoIdmodelo,
                    MarcaVeiculoIdmarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarca,
                    DescModelo = v.ModeloVeiculoIdmodeloNavigation.DescModelo,
                    DescMarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                    DescVeiculo = v.DescVeiculo,
                    EstadoVeiculo = v.EstadoVeiculo
                });
            }

            return Ok(listaDTO);
        }

        // GET: api/Veiculos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<VeiculoEditDTO>> GetVeiculo(int id)
        {
            var v = await _context.Veiculos
                .Include(x => x.ModeloVeiculoIdmodeloNavigation)
                .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .FirstOrDefaultAsync(x => x.Idveiculo == id);

            if (v == null) return NotFound();

            string? img64 = null;
            if (!string.IsNullOrEmpty(v.CaminhoFotoVeiculo))
            {
                var abs = Path.Combine(Directory.GetCurrentDirectory(),
                    v.CaminhoFotoVeiculo.Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(abs))
                {
                    var b = await System.IO.File.ReadAllBytesAsync(abs);
                    var ext = Path.GetExtension(abs).TrimStart('.');
                    img64 = $"data:image/{ext};base64,{Convert.ToBase64String(b)}";
                }
            }

            var dto = new VeiculoEditDTO
            {
                Idveiculo = v.Idveiculo,
                MatriculaVeiculo = v.MatriculaVeiculo,
                LotacaoVeiculo = v.LotacaoVeiculo,
                TaraVeiculo = v.TaraVeiculo,
                DescCor = v.DescCor,
                DataLegal = v.DataLegal,
                DataFabricacao = v.DataFabricacao,
                DataAquisicao = v.DataAquisicao,
                ValorDiarioVeiculo = v.ValorDiarioVeiculo,
                CaminhoFotoVeiculo = v.CaminhoFotoVeiculo,
                ImagemBase64 = img64,
                ModeloVeiculoIdmodelo = v.ModeloVeiculoIdmodelo,
                MarcaVeiculoIdmarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarca,
                DescModelo = v.ModeloVeiculoIdmodeloNavigation.DescModelo,
                DescMarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                DescVeiculo = v.DescVeiculo,
                EstadoVeiculo = v.EstadoVeiculo
            };

            return Ok(dto);
        }



        // PUT: api/Veiculos/edit
        [HttpPut("edit")]
        public async Task<IActionResult>
            PutVeiculo([FromForm] VeiculoEditDTO veiculoDTO) // Adicionado id ao parâmetro para consistência com a rota
        {

            var veiculo = await _context.Veiculos.FindAsync(veiculoDTO.Idveiculo);
            if (veiculo == null)
            {
                return NotFound($"Veículo com ID {veiculoDTO.Idveiculo} não encontrado.");
            }

            string? oldImagePath = veiculo.CaminhoFotoVeiculo;
            string? newImageRelativePath = null;

            // Processar nova imagem (se existir)
            if (veiculoDTO.ImagemVeiculo != null)
            {
                if (veiculoDTO.ImagemVeiculo.Length > 5 * 1024 * 1024) // 5MB
                {
                    return BadRequest("A imagem excede o tamanho máximo de 5MB.");
                }

                // Garante que a matrícula a usar no caminho existe
                var matriculaParaPasta = !string.IsNullOrWhiteSpace(veiculoDTO.MatriculaVeiculo)
                    ? veiculoDTO.MatriculaVeiculo
                    : veiculo.MatriculaVeiculo;

                if (string.IsNullOrWhiteSpace(matriculaParaPasta))
                {
                    return BadRequest("A matrícula do veículo é necessária para guardar a imagem.");
                }


                // Nome seguro do ficheiro
                var fileName = Path.GetFileName(veiculoDTO.ImagemVeiculo.FileName);
                // Cria um nome único para evitar conflitos e potenciais problemas de segurança
                var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

                var relativeFolderPath = Path.Combine("imageVeiculo", matriculaParaPasta);
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
                        await veiculoDTO.ImagemVeiculo.CopyToAsync(stream);
                    }

                    // Guarda o caminho relativo para a base de dados
                    newImageRelativePath = Path.Combine(relativeFolderPath, uniqueFileName)
                        .Replace(Path.DirectorySeparatorChar, '/'); // Normalizar para URL
                }
                catch (Exception ex)
                {
                    // Log do erro seria útil aqui
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        $"Erro ao guardar a imagem: {ex.Message}");
                }
            }

            // Atualizar propriedades do veículo a partir do DTO
            veiculo.MatriculaVeiculo =
                veiculoDTO.MatriculaVeiculo ??
                veiculo.MatriculaVeiculo; // Usa o valor do DTO se não for nulo, senão mantém o existente
            veiculo.LotacaoVeiculo = veiculoDTO.LotacaoVeiculo ?? veiculo.LotacaoVeiculo;
            veiculo.TaraVeiculo = veiculoDTO.TaraVeiculo ?? veiculo.TaraVeiculo;
            veiculo.DescCor = veiculoDTO.DescCor ?? veiculo.DescCor;
            veiculo.DataLegal = veiculoDTO.DataLegal ?? veiculo.DataLegal;
            veiculo.DataFabricacao = veiculoDTO.DataFabricacao ?? veiculo.DataFabricacao;
            veiculo.DataAquisicao = veiculoDTO.DataAquisicao ?? veiculo.DataAquisicao;
            veiculo.ValorDiarioVeiculo = veiculoDTO.ValorDiarioVeiculo ?? veiculo.ValorDiarioVeiculo;
            veiculo.ModeloVeiculoIdmodelo =
                veiculoDTO
                    .ModeloVeiculoIdmodelo; // Assume que o ID do modelo é sempre fornecido na edição se for alterado
            veiculo.DescVeiculo = veiculoDTO.DescVeiculo ?? veiculo.DescVeiculo;
            veiculo.EstadoVeiculo = veiculoDTO.EstadoVeiculo ?? veiculo.EstadoVeiculo;

            // Atualiza o caminho da imagem apenas se uma nova foi carregada com sucesso
            if (!string.IsNullOrEmpty(newImageRelativePath))
            {
                veiculo.CaminhoFotoVeiculo = newImageRelativePath;
            }

            _context.Entry(veiculo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();

                // Apagar a imagem antiga APENAS se uma nova imagem foi carregada e guardada com sucesso
                if (!string.IsNullOrEmpty(newImageRelativePath) && !string.IsNullOrEmpty(oldImagePath) &&
                    oldImagePath != newImageRelativePath)
                {
                    var oldAbsoluteFilePath = Path.Combine(Directory.GetCurrentDirectory(),
                        oldImagePath.Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(oldAbsoluteFilePath))
                    {
                        try
                        {
                            System.IO.File.Delete(oldAbsoluteFilePath);
                            // Opcional: Poderia apagar a diretoria da matrícula se estiver vazia, mas requer mais lógica.
                        }
                        catch (IOException ex)
                        {
                            // Log do erro ao apagar o ficheiro antigo
                            Console.WriteLine($"Erro ao apagar imagem antiga {oldAbsoluteFilePath}: {ex.Message}");
                            // Não retorna erro para o cliente, pois a atualização principal foi bem-sucedida
                        }
                    }
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VeiculoExists(veiculoDTO.Idveiculo))
                {
                    return NotFound($"Veículo com ID {veiculoDTO.Idveiculo} não encontrado durante o SaveChanges.");
                }
                else
                {
                    // Log do erro de concorrência
                    return Conflict(
                        "Ocorreu um conflito de concorrência. Os dados podem ter sido modificados por outro utilizador.");
                }
            }
            catch (Exception ex) // Captura outras exceções potenciais do SaveChanges
            {
                // Log do erro geral
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Erro ao atualizar o veículo: {ex.Message}");
            }


            // Retorna o veículo atualizado ou NoContent
            // Para retornar o veículo atualizado (útil para o cliente ver o estado final, incluindo o novo caminho da imagem):
            // return Ok(veiculo); // Pode precisar de incluir as navegações novamente se quiser devolvê-las aqui

            // Ou simplesmente NoContent se não for necessário retornar o objeto atualizado:
            return NoContent();
        }

        // POST: api/Veiculos

        [HttpPost]
        public async Task<ActionResult<Veiculo>> PostVeiculo([FromForm] VeiculoEditDTO veiculoDTO)
        {
            // Validação básica
            if (string.IsNullOrWhiteSpace(veiculoDTO.MatriculaVeiculo))
            {
                return BadRequest("A matrícula do veículo é obrigatória.");
            }

            if (veiculoDTO.ModeloVeiculoIdmodelo <= 0)
            {
                return BadRequest("O ID do modelo é inválido.");
            }

            // Processar imagem (se existir)
            string? imageRelativePath = null;

            if (veiculoDTO.ImagemVeiculo != null)
            {
                if (veiculoDTO.ImagemVeiculo.Length > 5 * 1024 * 1024) // 5MB
                {
                    return BadRequest("A imagem excede o tamanho máximo de 5MB.");
                }

                // Nome seguro do ficheiro
                var fileName = Path.GetFileName(veiculoDTO.ImagemVeiculo.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";

                var relativeFolderPath = Path.Combine("imageVeiculo", veiculoDTO.MatriculaVeiculo);
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
                        await veiculoDTO.ImagemVeiculo.CopyToAsync(stream);
                    }

                    imageRelativePath = Path.Combine(relativeFolderPath, uniqueFileName)
                        .Replace(Path.DirectorySeparatorChar, '/');
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        $"Erro ao guardar a imagem: {ex.Message}");
                }
            }

            // Criar novo veículo
            var veiculo = new Veiculo
            {
                MatriculaVeiculo = veiculoDTO.MatriculaVeiculo,
                LotacaoVeiculo = veiculoDTO.LotacaoVeiculo,
                TaraVeiculo = veiculoDTO.TaraVeiculo,
                DescCor = veiculoDTO.DescCor,
                DataLegal = veiculoDTO.DataLegal,
                DataFabricacao = veiculoDTO.DataFabricacao,
                DataAquisicao = veiculoDTO.DataAquisicao,
                ValorDiarioVeiculo = veiculoDTO.ValorDiarioVeiculo,
                ModeloVeiculoIdmodelo = veiculoDTO.ModeloVeiculoIdmodelo,
                DescVeiculo = veiculoDTO.DescVeiculo,
                EstadoVeiculo = veiculoDTO.EstadoVeiculo ?? "Disponível", // Valor padrão
                CaminhoFotoVeiculo = imageRelativePath
            };

            _context.Veiculos.Add(veiculo);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                if (VeiculoExistsByMatricula(veiculoDTO.MatriculaVeiculo))
                {
                    return Conflict("Já existe um veículo com esta matrícula.");
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        $"Erro ao criar o veículo: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Erro ao criar o veículo: {ex.Message}");
            }

            // Retorna o veículo criado com o ID gerado pela base de dados
            return CreatedAtAction("GetVeiculo", new { id = veiculo.Idveiculo }, veiculo);
        }

        private bool VeiculoExistsByMatricula(string matricula)
        {
            return _context.Veiculos.Any(e => e.MatriculaVeiculo == matricula);
        }

        // DELETE: api/Veiculos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVeiculo(int id)
        {
            var veiculo = await _context.Veiculos.FindAsync(id);
            if (veiculo == null) return NotFound();

            var imagePath = veiculo.CaminhoFotoVeiculo;
            _context.Veiculos.Remove(veiculo);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(imagePath))
            {
                var absFile = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    imagePath.Replace('/', Path.DirectorySeparatorChar)
                );
                if (System.IO.File.Exists(absFile))
                    System.IO.File.Delete(absFile);
            }

            return NoContent();
        }

        private bool VeiculoExists(int id)
        {
            return _context.Veiculos.Any(e => e.Idveiculo == id);
        }


        //----------------------------------------
        //Cliente pesquisa veiculo
        //----------------------------------------

        [HttpGet("clientePesquisaVeiculo")]
        public async Task<ActionResult<IEnumerable<ClienteVeiculoDTO>>> GetVeiculosCliente()
        {

            // FILTRAR VEÍCULOS COM ESTADO "Disponível" e incluir Aluguers
            var veiculos = await _context.Veiculos
                .Where(v => v.EstadoVeiculo == "Disponível")
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Include(v => v.Aluguers)
                .ToListAsync();

            var listaDTO = new List<ClienteVeiculoDTO>();
            foreach (var v in veiculos)
            {
                string? imagemBase64 = null;
                if (!string.IsNullOrEmpty(v.CaminhoFotoVeiculo))
                {
                    var abs = Path.Combine(Directory.GetCurrentDirectory(),
                        v.CaminhoFotoVeiculo.Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(abs))
                    {
                        var bytes = await System.IO.File.ReadAllBytesAsync(abs);
                        var ext = Path.GetExtension(abs).TrimStart('.');
                        imagemBase64 = $"data:image/{ext};base64,{Convert.ToBase64String(bytes)}";
                    }
                }

                float? avaliacaoMedia = null;
                if (v.Aluguers.Any(a => a.Classificacao.HasValue))
                {
                    avaliacaoMedia = v.Aluguers
                        .Where(a => a.Classificacao.HasValue)
                        .Average(a => a.Classificacao.Value);
                }

                listaDTO.Add(new ClienteVeiculoDTO
                {
                    Idveiculo = v.Idveiculo,
                    MatriculaVeiculo = v.MatriculaVeiculo,
                    LotacaoVeiculo = v.LotacaoVeiculo,
                    TaraVeiculo = v.TaraVeiculo,
                    DescCor = v.DescCor,
                    DataLegal = v.DataLegal,
                    DataFabricacao = v.DataFabricacao,
                    DataAquisicao = v.DataAquisicao,
                    ValorDiarioVeiculo = v.ValorDiarioVeiculo,
                    CaminhoFotoVeiculo = v.CaminhoFotoVeiculo,
                    ImagemBase64 = imagemBase64,
                    ModeloVeiculoIdmodelo = v.ModeloVeiculoIdmodelo,
                    MarcaVeiculoIdmarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarca,
                    DescModelo = v.ModeloVeiculoIdmodeloNavigation.DescModelo,
                    DescMarca = v.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                    DescVeiculo = v.DescVeiculo,
                    EstadoVeiculo = v.EstadoVeiculo,
                    Avaliacao = avaliacaoMedia
                });
            }

            return Ok(listaDTO);
        }

        [HttpGet("clienteVeiculo")]
        public async Task<ActionResult<ClienteVeiculoDTO>> GetVeiculoClienteID(int id)
        {

            // Busca apenas o veículo com o ID fornecido e estado "Disponível"
            var veiculo = await _context.Veiculos
                .Where(v => v.Idveiculo == id && v.EstadoVeiculo == "Disponível")
                .Include(v => v.ModeloVeiculoIdmodeloNavigation)
                .ThenInclude(m => m.MarcaVeiculoIdmarcaNavigation)
                .Include(v => v.Aluguers)
                .FirstOrDefaultAsync();

            if (veiculo == null)
            {
                return NotFound("Veículo não encontrado ou indisponível.");
            }

            // Processa imagem
            string? imagemBase64 = null;
            if (!string.IsNullOrEmpty(veiculo.CaminhoFotoVeiculo))
            {
                var abs = Path.Combine(Directory.GetCurrentDirectory(),
                    veiculo.CaminhoFotoVeiculo.Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(abs))
                {
                    var bytes = await System.IO.File.ReadAllBytesAsync(abs);
                    var ext = Path.GetExtension(abs).TrimStart('.');
                    imagemBase64 = $"data:image/{ext};base64,{Convert.ToBase64String(bytes)}";
                }
            }

            // Calcula avaliação média
            float? avaliacaoMedia = null;
            if (veiculo.Aluguers.Any(a => a.Classificacao.HasValue))
            {
                avaliacaoMedia = veiculo.Aluguers
                    .Where(a => a.Classificacao.HasValue)
                    .Average(a => a.Classificacao.Value);
            }

            var dto = new ClienteVeiculoDTO
            {
                Idveiculo = veiculo.Idveiculo,
                MatriculaVeiculo = veiculo.MatriculaVeiculo,
                LotacaoVeiculo = veiculo.LotacaoVeiculo,
                TaraVeiculo = veiculo.TaraVeiculo,
                DescCor = veiculo.DescCor,
                DataLegal = veiculo.DataLegal,
                DataFabricacao = veiculo.DataFabricacao,
                DataAquisicao = veiculo.DataAquisicao,
                ValorDiarioVeiculo = veiculo.ValorDiarioVeiculo,
                CaminhoFotoVeiculo = veiculo.CaminhoFotoVeiculo,
                ImagemBase64 = imagemBase64,
                ModeloVeiculoIdmodelo = veiculo.ModeloVeiculoIdmodelo,
                MarcaVeiculoIdmarca = veiculo.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarca,
                DescModelo = veiculo.ModeloVeiculoIdmodeloNavigation.DescModelo,
                DescMarca = veiculo.ModeloVeiculoIdmodeloNavigation.MarcaVeiculoIdmarcaNavigation.DescMarca,
                DescVeiculo = veiculo.DescVeiculo,
                EstadoVeiculo = veiculo.EstadoVeiculo,
                Avaliacao = avaliacaoMedia
            };

            bool existeAluguer = false;
            //Verifica o id do cliente a partir do token, e a partir do id do cliente verifica se existe aluguer, se existir retorna true
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                int idCliente = Convert.ToInt32(userId);
                existeAluguer = await _context.Aluguers.AnyAsync(a => a.ClienteIdcliente == idCliente && a.EstadoAluguer!="Alugado" && a.EstadoAluguer != "Pendente");
            }

            //retorna o dto, e se existe aluguer
            return Ok(new { Veiculo = dto, ExisteAluguer = existeAluguer });
        }
    }
}
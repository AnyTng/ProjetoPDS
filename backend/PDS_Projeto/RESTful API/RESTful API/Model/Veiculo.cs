using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Veiculo
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

    public int ModeloVeiculoIdmodelo { get; set; }

    public int ClasseVeiculoIdclasseVeiculo { get; set; }

    public int EstadoVeiculoIdestadoVeiculo { get; set; }

    public string? CaminhoFotoVeiculo { get; set; }

    public virtual ICollection<Aluguer> Aluguers { get; set; } = new List<Aluguer>();

    public virtual ClasseVeiculo ClasseVeiculoIdclasseVeiculoNavigation { get; set; } = null!;

    public virtual ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();

    public virtual EstadoVeiculo EstadoVeiculoIdestadoVeiculoNavigation { get; set; } = null!;

    public virtual ModeloVeiculo ModeloVeiculoIdmodeloNavigation { get; set; } = null!;

    public virtual ICollection<Seguro> Seguros { get; set; } = new List<Seguro>();
}

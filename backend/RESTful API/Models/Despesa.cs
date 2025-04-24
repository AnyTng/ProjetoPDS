using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Despesa
{
    public int VeiculoIdveiculo { get; set; }

    public int Iddespesa { get; set; }

    public string? DescConcurso { get; set; }

    public string? CaminhoFaturaPDF { get; set; }

    public string? EstadoConcurso { get; set; }

    public DateTime? DataInicio { get; set; }

    public DateTime? DataFim { get; set; }


    public virtual ICollection<Manutencao> Manutencaos { get; set; } = new List<Manutencao>();

    public virtual Veiculo VeiculoIdveiculoNavigation { get; set; } = null!;
}

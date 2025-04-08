using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Seguro
{
    public string ApoliceSeguro { get; set; } = null!;

    public DateTime? DataRenovacao { get; set; }

    public float? ValorInicial { get; set; }

    public string? DescSeguro { get; set; }

    public int SeguradoraIdseguradora { get; set; }

    public int VeiculoIdveiculo { get; set; }

    public virtual Seguradora SeguradoraIdseguradoraNavigation { get; set; } = null!;

    public virtual Veiculo VeiculoIdveiculoNavigation { get; set; } = null!;
}

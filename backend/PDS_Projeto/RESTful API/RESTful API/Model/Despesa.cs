using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Despesa
{
    public int VeiculoIdveiculo { get; set; }

    public int TipoDespesaIdtdespesa { get; set; }

    public float? ValorDespesa { get; set; }

    public DateTime? DataPagDes { get; set; }

    public int Iddespesa { get; set; }

    public virtual ICollection<Manutencao> Manutencaos { get; set; } = new List<Manutencao>();

    public virtual TipoDespesa TipoDespesaIdtdespesaNavigation { get; set; } = null!;

    public virtual Veiculo VeiculoIdveiculoNavigation { get; set; } = null!;
}

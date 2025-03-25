using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class TipoDespesa
{
    public int Idtdespesa { get; set; }

    public string? DescTdespesa { get; set; }

    public virtual ICollection<Despesa> Despesas { get; set; } = new List<Despesa>();
}

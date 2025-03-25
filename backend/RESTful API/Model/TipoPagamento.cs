using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class TipoPagamento
{
    public int Idtpagamento { get; set; }

    public string? DescTpagamento { get; set; }

    public virtual ICollection<Recibo> Recibos { get; set; } = new List<Recibo>();
}

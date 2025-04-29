using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Recibo
{
    public int Idrecibo { get; set; }

    public DateTime? DataRecibo { get; set; }

    public string TipoPagamento { get; set; } = null!;

    public int AluguerIdaluguer { get; set; }

    public virtual Aluguer AluguerIdaluguerNavigation { get; set; } = null!;
}

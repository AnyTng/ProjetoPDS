using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Recibo
{
    public int FaturaIdfatura { get; set; }

    public int Idrecibo { get; set; }

    public DateTime? DataRecibo { get; set; }

    public int? ValorRecibo { get; set; }

    public int TipoPagamentoIdtpagamento { get; set; }

    public int AluguerIdaluguer { get; set; }

    public virtual Aluguer AluguerIdaluguerNavigation { get; set; } = null!;

    public virtual TipoPagamento TipoPagamentoIdtpagamentoNavigation { get; set; } = null!;
}

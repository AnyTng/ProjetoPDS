using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Aluguer
{
    public int Idaluguer { get; set; }

    public int VeiculoIdveiculo { get; set; }

    public int ClienteIdcliente { get; set; }

    public DateTime? DataLevantamento { get; set; }

    public DateTime? DataEntregaPrevista { get; set; }

    public DateTime? DataDevolucao { get; set; }

    public DateTime? DataFatura { get; set; }

    public float? Classificacao { get; set; }

    public float? ValorReserva { get; set; }

    public float? ValorQuitacao { get; set; }

    public virtual Cliente ClienteIdclienteNavigation { get; set; } = null!;

    public virtual ICollection<Infracao> Infracos { get; set; } = new List<Infracao>();

    public virtual ICollection<Recibo> Recibos { get; set; } = new List<Recibo>();

    public virtual Veiculo VeiculoIdveiculoNavigation { get; set; } = null!;
}

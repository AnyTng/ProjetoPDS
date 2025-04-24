using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Infracao
{
    public int Idinfracao { get; set; }

    public int AluguerIdaluguer { get; set; }

    public DateTime? DataInfracao { get; set; }

    public double ValorInfracao { get; set; }

    public string? DescInfracao { get; set; }

    public string? EstadoInfracao { get; set; }

    public virtual Aluguer AluguerIdaluguerNavigation { get; set; } = null!;

    public virtual ICollection<Contestacao> Contestacaos { get; set; } = new List<Contestacao>();
}

using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Orcamento
{
    public int Idorcamento { get; set; }

    public float? ValorReserva { get; set; }

    public float? ValorQuitacao { get; set; }

    public virtual ICollection<Aluguer> Aluguers { get; set; } = new List<Aluguer>();
}

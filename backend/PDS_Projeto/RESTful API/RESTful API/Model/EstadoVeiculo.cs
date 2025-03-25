using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class EstadoVeiculo
{
    public int IdestadoVeiculo { get; set; }

    public string? DescEstado { get; set; }

    public virtual ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}

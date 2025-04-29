using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class MarcaVeiculo
{
    public int Idmarca { get; set; }

    public string? DescMarca { get; set; }

    public virtual ICollection<ModeloVeiculo> ModeloVeiculos { get; set; } = new List<ModeloVeiculo>();
}

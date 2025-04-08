using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class ModeloVeiculo
{
    public int Idmodelo { get; set; }

    public string? DescModelo { get; set; }

    public int MarcaVeiculoIdmarca { get; set; }

    public virtual MarcaVeiculo MarcaVeiculoIdmarcaNavigation { get; set; } = null!;

    public virtual ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}

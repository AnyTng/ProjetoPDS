using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class ClasseVeiculo
{
    public int IdclasseVeiculo { get; set; }

    public string? DescClasseVeiculo { get; set; }

    public virtual ICollection<HabilitacaoCliente> HabilitacaoClientes { get; set; } = new List<HabilitacaoCliente>();

    public virtual ICollection<Veiculo> Veiculos { get; set; } = new List<Veiculo>();
}

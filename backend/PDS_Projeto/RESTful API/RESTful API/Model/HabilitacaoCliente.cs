using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class HabilitacaoCliente
{
    public int ClienteIdcliente { get; set; }

    public int ClasseVeiculoIdclasseVeiculo { get; set; }

    public DateTime? DataHabilitacao { get; set; }

    public virtual ClasseVeiculo ClasseVeiculoIdclasseVeiculoNavigation { get; set; } = null!;

    public virtual Cliente ClienteIdclienteNavigation { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Cliente
{
    public int Idcliente { get; set; }

    public string? NomeCliente { get; set; }

    public DateTime? DataNascCliente { get; set; }

    public int? Nifcliente { get; set; }

    public string? RuaCliente { get; set; }

    public int CodigoPostalCp { get; set; }

    public int LoginIdlogin { get; set; }

    public float? CreditoCliente { get; set; }

    public int? ContactoC1 { get; set; }

    public int? ContactoC2 { get; set; }

    public virtual ICollection<Aluguer> Aluguers { get; set; } = new List<Aluguer>();

    public virtual CodigoPostal CodigoPostalCpNavigation { get; set; } = null!;

    public virtual ICollection<Contestacao> Contestacaos { get; set; } = new List<Contestacao>();

    public virtual ICollection<HabilitacaoCliente> HabilitacaoClientes { get; set; } = new List<HabilitacaoCliente>();

    public virtual Login LoginIdloginNavigation { get; set; } = null!;
}

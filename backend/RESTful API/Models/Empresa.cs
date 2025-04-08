using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Empresa
{
    public int Idempresa { get; set; }

    public string? FuncionarioEmpresa { get; set; }

    public string? NomeEmpresa { get; set; }

    public int? NifEmpresa { get; set; }

    public string? RuaEmpresa { get; set; }

    public int CodigoPostalCp { get; set; }

    public int LoginIdlogin { get; set; }

    public int? ContactoE1 { get; set; }

    public int? ContactoE2 { get; set; }

    public virtual CodigoPostal CodigoPostalCpNavigation { get; set; } = null!;

    public virtual Login LoginIdloginNavigation { get; set; } = null!;

    public virtual ICollection<Manutencao> Manutencaos { get; set; } = new List<Manutencao>();
}

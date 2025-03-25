using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Manutencao
{
    public int Idmanutencao { get; set; }

    public DateTime? DataManutencao { get; set; }

    public string? DescManutencao { get; set; }

    public int VeiculoIdveiculo { get; set; }

    public int EmpresaIdempresa { get; set; }

    public int DespesaIddespesa { get; set; }

    public string? CaminhoPdf { get; set; }

    public virtual Despesa DespesaIddespesaNavigation { get; set; } = null!;

    public virtual Empresa EmpresaIdempresaNavigation { get; set; } = null!;
}

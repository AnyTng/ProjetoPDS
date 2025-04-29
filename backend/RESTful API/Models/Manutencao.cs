using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Manutencao
{
    public int Idmanutencao { get; set; }

    public string? DescProposta { get; set; }

    public double ValorProposta { get; set; }

    public string? EstadoProposta { get; set; }

    public DateTime? DataFimMan { get; set; }

    public DateTime? DataInicioMan { get; set; }

    public int EmpresaIdempresa { get; set; }

    public int DespesaIddespesa { get; set; }


    public virtual Despesa DespesaIddespesaNavigation { get; set; } = null!;

    public virtual Empresa EmpresaIdempresaNavigation { get; set; } = null!;
}

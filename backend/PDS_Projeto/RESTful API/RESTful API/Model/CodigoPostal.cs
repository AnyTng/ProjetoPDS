using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class CodigoPostal
{
    public int Cp { get; set; }

    public string? Localidade { get; set; }

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Empresa> Empresas { get; set; } = new List<Empresa>();
}

using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Seguradora
{
    public int Idseguradora { get; set; }

    public string? DescSeguradora { get; set; }

    public virtual ICollection<Seguro> Seguros { get; set; } = new List<Seguro>();
}

using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Login
{
    public int Idlogin { get; set; }

    public string? Email { get; set; }

    public string? HashPassword { get; set; }

    public int TipoLoginIdtlogin { get; set; }

    public virtual ICollection<Admin> Admins { get; set; } = new List<Admin>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<Empresa> Empresas { get; set; } = new List<Empresa>();

    public virtual TipoLogin TipoLoginIdtloginNavigation { get; set; } = null!;
}

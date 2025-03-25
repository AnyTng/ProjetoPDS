using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class TipoLogin
{
    public int Idtlogin { get; set; }

    public string? Tlogin { get; set; }

    public virtual ICollection<Login> Logins { get; set; } = new List<Login>();
}

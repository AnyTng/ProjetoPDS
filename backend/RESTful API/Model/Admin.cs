using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Admin
{
    public int Idadmin { get; set; }

    public string? NomeAdmin { get; set; }

    public int? NifAdmin { get; set; }

    public int LoginIdlogin { get; set; }

    public virtual Login LoginIdloginNavigation { get; set; } = null!;
}

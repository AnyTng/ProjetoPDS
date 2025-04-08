using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Notificacao
{
    public int Idnotif { get; set; }

    public string? ConteudoNotif { get; set; }

    public int LoginIdlogin { get; set; }

    public virtual Login LoginIdloginNavigation { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace RESTful_API.Models;

public partial class Contestacao
{
    public int InfracoesIdinfracao { get; set; }

    public int ClienteIdcliente { get; set; }

    public string? DescContestacao { get; set; }

    public string? EstadoContestacao { get; set; }

    public int Idcontestacao { get; set; }

    public virtual Cliente ClienteIdclienteNavigation { get; set; } = null!;

    public virtual Infracao InfracoesIdinfracaoNavigation { get; set; } = null!;
}

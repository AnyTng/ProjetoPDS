using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Contestacao
{
    public int InfracoesIdinfracao { get; set; }

    public int ClienteIdcliente { get; set; }

    public string? DescContestacao { get; set; }

    public int EstadoContestacaoIdestadoC { get; set; }

    public virtual Cliente ClienteIdclienteNavigation { get; set; } = null!;

    public virtual EstadoContestacao EstadoContestacaoIdestadoCNavigation { get; set; } = null!;

    public virtual Infraco InfracoesIdinfracaoNavigation { get; set; } = null!;
}

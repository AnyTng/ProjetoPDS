using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class EstadoContestacao
{
    public int IdestadoC { get; set; }

    public string? DescEstadoC { get; set; }

    public virtual ICollection<Contestacao> Contestacaos { get; set; } = new List<Contestacao>();
}

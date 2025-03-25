using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Infraco
{
    public int Idinfracao { get; set; }

    public int TipoInfracaoIdtinfracao { get; set; }

    public int AluguerIdaluguer { get; set; }

    public DateTime? DataInfracao { get; set; }

    public int? ValorInfracao { get; set; }

    public virtual Aluguer AluguerIdaluguerNavigation { get; set; } = null!;

    public virtual ICollection<Contestacao> Contestacaos { get; set; } = new List<Contestacao>();

    public virtual TipoInfracao TipoInfracaoIdtinfracaoNavigation { get; set; } = null!;
}

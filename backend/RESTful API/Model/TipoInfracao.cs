using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class TipoInfracao
{
    public int Idtinfracao { get; set; }

    public string? DescTinfracao { get; set; }

    public virtual ICollection<Infraco> Infracos { get; set; } = new List<Infraco>();
}

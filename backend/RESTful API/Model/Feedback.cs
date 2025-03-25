using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Feedback
{
    public int AluguerIdaluguer { get; set; }

    public float? Classificacao { get; set; }

    public string? DescOpiniao { get; set; }

    public int Idfeedback { get; set; }

    public virtual Aluguer AluguerIdaluguerNavigation { get; set; } = null!;
}

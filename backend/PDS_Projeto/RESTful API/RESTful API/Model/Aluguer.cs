using System;
using System.Collections.Generic;

namespace RESTful_API.Model;

public partial class Aluguer
{
    public int Idaluguer { get; set; }

    public int VeiculoIdveiculo { get; set; }

    public int ClienteIdcliente { get; set; }

    public DateTime? DataLevantamento { get; set; }

    public DateTime? DataEntregaPrevista { get; set; }

    public DateTime? DataDevolucao { get; set; }

    public DateTime? DataFatura { get; set; }

    public int OrcamentoIdorcamento { get; set; }

    public virtual Cliente ClienteIdclienteNavigation { get; set; } = null!;

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Infraco> Infracos { get; set; } = new List<Infraco>();

    public virtual Orcamento OrcamentoIdorcamentoNavigation { get; set; } = null!;

    public virtual ICollection<Recibo> Recibos { get; set; } = new List<Recibo>();

    public virtual Veiculo VeiculoIdveiculoNavigation { get; set; } = null!;
}


using RESTful_API.Model;
using System.ComponentModel.DataAnnotations;

namespace RESTful_API.DTOS
{
    public class ClienteDTO
    {
        [Required]
        public string? NomeCliente { get; set; }

        public DateTime? DataNascCliente { get; set; }

        public int? Nifcliente { get; set; }

        public string? RuaCliente { get; set; }

        public int CodigoPostalCp { get; set; }

        public float? CreditoCliente { get; set; }

        public int? ContactoC1 { get; set; }

        public int? ContactoC2 { get; set; }

    }
}
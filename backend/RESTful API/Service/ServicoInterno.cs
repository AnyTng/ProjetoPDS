using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using RESTful_API.Models;
using RESTful_API.Interface;
using RESTful_API.Service;

namespace RESTful_API.Service
{
    public class ServicoInterno
    {
        
        private readonly ILogger<ServicoInterno> _logger;
        private readonly IEmailService _emailService;


        public ServicoInterno(ILogger<ServicoInterno> logger, IEmailService emailService)
        {
            _logger = logger;
            _emailService = emailService;
        }

        public void Executar()
        {
            // Lógica da tarefa interna
           //var aluguers = _();

            _logger.LogInformation("Executando tarefa diária às {hora}", DateTime.Now);
            _logger.LogInformation("BANANA");

        }

    }
}

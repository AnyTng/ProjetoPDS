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
        private readonly IConfiguration _config;
        private readonly PdsContext _context;


        public ServicoInterno(ILogger<ServicoInterno> logger, IEmailService emailService, IConfiguration config, PdsContext context)
        {
            _logger = logger;
            _emailService = emailService;
            _config = config;
            _context = context;
        }

        public async Task Executar()
        {
            // Lógica da tarefa interna
            var aluguers = await _context.Aluguers
                .Include(a=>a.ClienteIdclienteNavigation)
                .Where(a=>a.EstadoAluguer=="Aguada Levantamento" || a.EstadoAluguer == "Alugado")
                .ToListAsync();


            foreach (var aluguer in aluguers)
            {
                if (aluguer.DataDevolucao < DateTime.Now && aluguer.EstadoAluguer == "Alugado")
                {
                    var cliente = aluguer.ClienteIdclienteNavigation;
                    if (cliente != null )
                    {
                        var email = cliente.LoginIdloginNavigation.Email;
                        var assunto = "Notificação de Infração - Resolução da sua contestacao";
                        var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>Vimos por este meio informá-lo(a) de que, a data de devolução do veiculo alugado foi a {aluguer.DataEntregaPrevista}.<br>Fique avisado que cada dia de atraso ser-lhe a cobrado, por isso devolva o veiculo o quanto antes<br><br>" +
                                        $"<br><br><br>__<br>" +
                                        $"Com os melhores cumprimentos,<br>" +
                                        $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                        $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                        $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                        $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                        await _emailService.EnviarEmail(email, assunto, mensagem);
                        aluguer.EstadoAluguer = "Irregular";
                        _context.Update(aluguer);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Aluguer irregular: {aluguerId}", aluguer.Idaluguer);

                    }
                }

                if (aluguer.DataLevantamento < DateTime.Now && aluguer.EstadoAluguer == "Aguada Levantamento")
                {
                    var cliente = aluguer.ClienteIdclienteNavigation;

                    // se o dia de hoje for igual ao dia de levantamento + 1 dia
                    if (aluguer.DataLevantamento.HasValue && aluguer.DataLevantamento.Value.AddDays(1).Date == DateTime.Today)
                    {
                        if (cliente != null)
                        {
                            var email = cliente.LoginIdloginNavigation.Email;
                            var assunto = "Notificação de Infração - Resolução da sua contestacao";
                            var mensagem = $"Caro/a {cliente.NomeCliente},<br><br>Vimos por este meio informá-lo(a) de que, a data de levantamento do veiculo alugado foi a {aluguer.DataLevantamento}.<br>Tem um praso de 2 dias para decorrer ao levantamento do veiculo, apos esse periodo a reserva sera cancelada.<br><br>" +
                                            $"<br><br><br>__<br>" +
                                            $"Com os melhores cumprimentos,<br>" +
                                            $"&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<b><i>CarXpress Team</i></b><br><br>" +
                                            $"&emsp;<b>Empresa:</b>&emsp;&emsp;&emsp;  CarExpress, Lda<br>" +
                                            $"&emsp;<b>Contacto:</b>&emsp;&emsp;&emsp;  963 183 446<br>" +
                                            $"&emsp;<b>Morada:</b>&emsp;&emsp;&emsp;&emsp;Rua das Ameixas, Nº54, 1234-567, Frossos, Braga";
                            await _emailService.EnviarEmail(email, assunto, mensagem);

                        }
                    }
                    // se o dia de hoje for igual ao dia de levantamento + 3 dias   
                    if (aluguer.DataLevantamento.HasValue && aluguer.DataLevantamento.Value.AddDays(3).Date == DateTime.Today)
                    {
                        if (cliente != null)
                        {
                            aluguer.EstadoAluguer = "Cancelado";
                            _context.Update(aluguer);
                            await _context.SaveChangesAsync();
                            var veiculo = await _context.Veiculos.FindAsync(aluguer.VeiculoIdveiculo);
                            if (veiculo != null)
                            {
                                veiculo.EstadoVeiculo = "Disponivel";
                                _context.Update(veiculo);
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }
            }




        }

    }
}

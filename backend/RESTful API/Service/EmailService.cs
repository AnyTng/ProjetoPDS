namespace RESTful_API.Service
{
    using MailKit.Net.Smtp;
    using MimeKit;
    using RESTful_API.Interface;

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task EnviarEmail(string destino, string assunto, string mensagem)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_configuration["EmailSettings:From"]));
            email.To.Add(MailboxAddress.Parse(destino));
            email.Subject = assunto;
            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = mensagem };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_configuration["EmailSettings:SmtpServer"], int.Parse(_configuration["EmailSettings:Port"]), true);
            await smtp.AuthenticateAsync(_configuration["EmailSettings:From"], _configuration["EmailSettings:Password"]);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }

}

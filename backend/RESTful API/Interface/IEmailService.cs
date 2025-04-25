namespace RESTful_API.Interface
{
    public interface IEmailService
    {
        Task EnviarEmail(string destino, string assunto, string mensagem);
    }

}

namespace RESTful_API.Model
{
    public class Login
    {
        public int ID { get; set; }

        public string? Nome { get; set; }

        public string? Email { get; set; }

        public byte[] PasswordHash { get; set; }

        public byte[] PasswordSalt { get; set; }

        public Login(int id, string nome, string email)
        {
            Nome = nome;
            Email = email;
            ID = id;
        }

        public Login(string nome, string email)
        {
            Nome = nome;
            Email = email;
        }

        public void AlterarPassword(byte[] passwordHash, byte[] passwordSalt)
        {
            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
        }

        



    }
}

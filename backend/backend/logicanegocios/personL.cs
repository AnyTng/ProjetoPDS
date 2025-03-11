using data;

namespace logicanegocios
{
    public class personL
    {
        public static bool AddPerson(models.Person p)
        {
            if (p.Id == null)
                return false;

            return personD.AddPerson(p);
        }
    }
}

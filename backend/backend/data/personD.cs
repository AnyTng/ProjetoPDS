using models;

namespace data
{
    public class personD
    {
        static List<Person> people = new List<Person>(5);

        public static bool AddPerson(Person p)
        {
            people.Add(p);
            return true;
        }   
    }
}

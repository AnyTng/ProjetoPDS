namespace models
{
    public class Person
    {
        int id;
        string name;

        public int Id 
        {
            get { return id; }
            set { id = value; }
        }

        public string Name
        {
            get { return name; }
            set { name = value; }
        }

        public Person(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}

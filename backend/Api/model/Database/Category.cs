namespace Api.model
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // Navigation property per la relazione 1:N con Activity
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}
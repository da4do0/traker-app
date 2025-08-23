namespace Api.model
{
    public class Activity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Calories { get; set; }
        public int CategoryId { get; set; }
        public int UserId { get; set; }

        // Navigation property per la relazione N:1 con Category
        public virtual Category Category { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
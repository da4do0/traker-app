namespace Api.model
{
    public class Activity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int Calories { get; set; }
        public int CategoryId { get; set; }
        public string User { get; set; } = string.Empty;
    }
}
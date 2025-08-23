namespace Api.model
{
    public class Misuration
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime Date { get; set; }
        public float Weight { get; set; }
        public float Height { get; set; }
        public float IMC { get; set; }
        public float FFMI { get; set; }
        public virtual User User { get; set; } = null!;

    }
}

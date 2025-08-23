namespace Api.model
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string sex { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }

        // Navigation property per la relazione N:N con Food
        public virtual ICollection<UserFood> UserFoods { get; set; } = new List<UserFood>();
        
        // Navigation property per la relazione 1:N con Misuration
        public virtual ICollection<Misuration> Misurations { get; set; } = new List<Misuration>();
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}

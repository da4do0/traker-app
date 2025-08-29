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
        
        // New fields for calorie calculation
        public ActivityLevel ActivityLevel { get; set; } = ActivityLevel.ModeratelyActive;
        public WeightGoal WeightGoal { get; set; } = WeightGoal.MaintainWeight;
        public float? TargetWeight { get; set; }
        public int DailyCalorieGoal { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property per la relazione N:N con Food
        public virtual ICollection<UserFood> UserFoods { get; set; } = new List<UserFood>();
        
        // Navigation property per la relazione 1:N con Misuration
        public virtual ICollection<Misuration> Misurations { get; set; } = new List<Misuration>();
        public virtual ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }

    public enum ActivityLevel
    {
        Sedentary = 1,
        LightlyActive = 2,
        ModeratelyActive = 3,
        VeryActive = 4,
        ExtremelyActive = 5
    }

    public enum WeightGoal
    {
        LoseWeight = 1,
        MaintainWeight = 2,
        GainWeight = 3
    }
}

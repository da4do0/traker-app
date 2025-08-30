using Api.model;

namespace model.DTOs.Auth
{
    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Cognome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Sex { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public float Weight { get; set; }
        public float Height { get; set; }
        public ActivityLevel ActivityLevel { get; set; } = ActivityLevel.ModeratelyActive;
        public WeightGoal WeightGoal { get; set; } = WeightGoal.MaintainWeight;
        public float? TargetWeight { get; set; }
        public int DailyCalorieGoal { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    }
}
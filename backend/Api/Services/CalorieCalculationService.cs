using Api.model;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public interface ICalorieCalculationService
    {
        int CalculateDailyCalories(User user);
        double CalculateBMR(User user, float height, float weight);
        double GetActivityMultiplier(ActivityLevel activityLevel);
        int ApplyGoalAdjustment(double tdee, WeightGoal goal);
        Task<int> CalculateDailyCaloriesAsync(int userId, ApiDbContext context);
    }

    public class CalorieCalculationService : ICalorieCalculationService
    {
        public int CalculateDailyCalories(User user)
        {
            // Get the latest misuration for the user
            var latestMisuration = user.Misurations?.OrderByDescending(m => m.Date).FirstOrDefault();
            
            if (latestMisuration == null)
            {
                // Default values if no misuration exists
                return 2000; // Default calorie goal
            }

            var bmr = CalculateBMR(user, latestMisuration.Height, latestMisuration.Weight);
            var multiplier = GetActivityMultiplier(user.ActivityLevel);
            var tdee = bmr * multiplier;
            return ApplyGoalAdjustment(tdee, user.WeightGoal);
        }

        public async Task<int> CalculateDailyCaloriesAsync(int userId, ApiDbContext context)
        {
            var user = await context.Users
                .Include(u => u.Misurations)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new ArgumentException("User not found");

            return CalculateDailyCalories(user);
        }

        public double CalculateBMR(User user, float height, float weight)
        {
            var age = DateTime.Today.Year - user.DateOfBirth.Year;
            if (DateTime.Today < user.DateOfBirth.AddYears(age)) 
                age--;

            // Mifflin-St Jeor Equation
            if (user.sex.ToLower() == "male")
            {
                return (10 * weight) + (6.25 * height) - (5 * age) + 5;
            }
            else
            {
                return (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }
        }

        public double GetActivityMultiplier(ActivityLevel activityLevel)
        {
            return activityLevel switch
            {
                ActivityLevel.Sedentary => 1.2,
                ActivityLevel.LightlyActive => 1.375,
                ActivityLevel.ModeratelyActive => 1.55,
                ActivityLevel.VeryActive => 1.725,
                ActivityLevel.ExtremelyActive => 1.9,
                _ => 1.2
            };
        }

        public int ApplyGoalAdjustment(double tdee, WeightGoal goal)
        {
            return goal switch
            {
                WeightGoal.LoseWeight => (int)(tdee - 500), // 1 lb per week deficit
                WeightGoal.MaintainWeight => (int)tdee,
                WeightGoal.GainWeight => (int)(tdee + 400), // Conservative surplus
                _ => (int)tdee
            };
        }
    }
}
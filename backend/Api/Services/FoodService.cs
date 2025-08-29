using Api.Interfaces;
using Api.model;
using Microsoft.EntityFrameworkCore;

namespace Api.Services
{
    public class FoodService : IFoodService
    {
        private readonly ApiDbContext _context;

        public FoodService(ApiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Food>> GetAllFoodsAsync()
        {
            return await _context.Foods
                .Include(f => f.UserFoods)
                .ThenInclude(uf => uf.User)
                .ToListAsync();
        }

        public async Task<Food?> GetFoodByIdAsync(int id)
        {
            return await _context.Foods
                .Include(f => f.UserFoods)
                .ThenInclude(uf => uf.User)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<Food?> GetFoodByCodeAsync(string code)
        {
            return await _context.Foods
                .Include(f => f.UserFoods)
                .ThenInclude(uf => uf.User)
                .FirstOrDefaultAsync(f => f.code == code);
        }

        public async Task<Food> CreateFoodAsync(Food food)
        {
            _context.Foods.Add(food);
            await _context.SaveChangesAsync();
            return food;
        }

        public async Task<Food?> UpdateFoodAsync(int id, Food food)
        {
            var existingFood = await _context.Foods.FindAsync(id);
            if (existingFood == null) return null;

            existingFood.Name = food.Name;
            existingFood.Description = food.Description;
            existingFood.Image = food.Image;
            existingFood.Calories = food.Calories;
            existingFood.Proteins = food.Proteins;
            existingFood.Carbohydrates = food.Carbohydrates;
            existingFood.Fats = food.Fats;
            existingFood.code = food.code;

            await _context.SaveChangesAsync();
            return existingFood;
        }

        public async Task<bool> DeleteFoodAsync(int id)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return false;

            _context.Foods.Remove(food);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Food>> SearchFoodsAsync(string searchTerm)
        {
            return await _context.Foods
                .Where(f => f.Name.Contains(searchTerm) ||
                           f.Description.Contains(searchTerm) ||
                           f.code.Contains(searchTerm))
                .Include(f => f.UserFoods)
                .ThenInclude(uf => uf.User)
                .ToListAsync();
        }

        // Metodi per la relazione User-Food
        public async Task<bool> AddFoodToUserAsync(int userId, int foodId, int quantity, string mealType)
        {
            if (!Enum.TryParse<UserFood.MealType>(mealType, true, out var parsedMealType))
            {
                return false; // Invalid meal type
            }

            return await AddFoodToUserAsync(userId, foodId, quantity, parsedMealType);
        }

        public async Task<bool> AddFoodToUserAsync(int userId, int foodId, int quantity, UserFood.MealType mealType)
        {
            var user = await _context.Users.FindAsync(userId);
            var food = await _context.Foods.FindAsync(foodId);

            if (user == null || food == null) return false;

            var userFood = new UserFood
            {
                UserId = userId,
                FoodId = foodId,
                Quantity = quantity,
                Meal = mealType,
                Date = DateTime.Now
            };

            _context.UserFoods.Add(userFood);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserFood>> GetUserFoodsAsync(int userId)
        {
            return await _context.UserFoods
                .Where(uf => uf.UserId == userId)
                .Include(uf => uf.Food)
                .Include(uf => uf.User)
                .OrderByDescending(uf => uf.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserFood>> GetUserFoodsByDateAsync(int userId, DateTime date)
        {
            return await _context.UserFoods
                .Where(uf => uf.UserId == userId && uf.Date.Date == date.Date)
                .Include(uf => uf.Food)
                .Include(uf => uf.User)
                .OrderBy(uf => uf.Meal)
                .ToListAsync();
        }

        public async Task<bool> RemoveUserFoodAsync(int userFoodId)
        {
            var userFood = await _context.UserFoods.FindAsync(userFoodId);
            if (userFood == null) return false;

            _context.UserFoods.Remove(userFood);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Object> GetUserCaloriesAsync(int userId)
        {
            var totalCalories = await _context.UserFoods
            .Include(uf => uf.Food)     // carica la relazione con Foods
            .Include(uf => uf.User)     // carica la relazione con Users
            .SumAsync(uf => (uf.Food.Calories * uf.Quantity) / 100.0);

            return totalCalories;
        }
    }
}
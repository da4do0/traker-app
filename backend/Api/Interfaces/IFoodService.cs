using Api.model;

namespace Api.Interfaces
{
    public interface IFoodService
    {
        Task<IEnumerable<Food>> GetAllFoodsAsync();
        Task<Food?> GetFoodByIdAsync(int id);
        Task<Food?> GetFoodByCodeAsync(string code);
        Task<Food> CreateFoodAsync(Food food);
        Task<Food?> UpdateFoodAsync(int id, Food food);
        Task<bool> DeleteFoodAsync(int id);
        Task<IEnumerable<Food>> SearchFoodsAsync(string searchTerm);

        // Metodi per la relazione User-Food
        Task<bool> AddFoodToUserAsync(int userId, int foodId, int quantity, string mealType);
        Task<bool> AddFoodToUserAsync(int userId, int foodId, int quantity, UserFood.MealType mealType);
        Task<IEnumerable<UserFood>> GetUserFoodsAsync(int userId);
        Task<IEnumerable<UserFood>> GetUserFoodsByDateAsync(int userId, DateTime date);
        Task<bool> RemoveUserFoodAsync(int userFoodId);
        Task<Object> GetUserCaloriesAsync(int userId);
        Task<Object> GetUserFoodListAsync(int userId);
    }
}
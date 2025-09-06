namespace Api.model
{
    public class Food
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public int Calories { get; set; }
        public int Proteins { get; set; }
        public int Carbohydrates { get; set; }
        public int Fats { get; set; }
        public string? code { get; set; } = string.Empty;

        // Navigation property per la relazione N:N con User
        public virtual ICollection<UserFood> UserFoods { get; set; } = new List<UserFood>();
        public virtual ICollection<FoodIngredient> FoodIngredients { get; set; } = new List<FoodIngredient>();
    }
}
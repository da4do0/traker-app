namespace Api.model
{
    public class FoodIngredient
    {
        public int FoodId { get; set; }
        public int IngredientId { get; set; }

        // Navigation properties
        public virtual Food Food { get; set; } = null!;
        public virtual Ingredient Ingredient { get; set; } = null!;
    }
}
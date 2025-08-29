namespace Api.model
{
    public class Ingredient
    {
        public int Id { get; set; }
        public string name { get; set; } = string.Empty;
        public string brand { get; set; } = string.Empty;

        public virtual ICollection<FoodIngredient> FoodIngredients { get; set; } = new List<FoodIngredient>();

    }
}

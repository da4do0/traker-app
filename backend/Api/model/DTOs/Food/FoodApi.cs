namespace Api.model
{
    public class FoodApi
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public int Calories { get; set; }
        public int Proteins { get; set; }
        public int Carbohydrates { get; set; }
        public int Fats { get; set; }
        public string code { get; set; } = string.Empty;
        public string Username { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public string Meal { get; set; } = string.Empty;
    }
}
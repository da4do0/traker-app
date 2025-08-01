namespace Api.model
{
    public class UsdaFoodNutrient
    {
        public double amount { get; set; }
        public string? nutrientName { get; set; }
        public string? unitName { get; set; }
        public double value { get; set; }
        public UsdaNutrient? nutrient { get; set; }
    }
}

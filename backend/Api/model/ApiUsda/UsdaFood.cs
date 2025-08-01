namespace Api.model
{
    public class UsdaFood
    {
        public int fdcId { get; set; }
        public string? description { get; set; }
        public string? dataType { get; set; }
        public string? brandOwner { get; set; }
        public string? brandName { get; set; }
        public string? ingredients { get; set; }
        public double? servingSize { get; set; }
        public string? servingSizeUnit { get; set; }
        public List<UsdaFoodNutrient>? foodNutrients { get; set; }
    }
}

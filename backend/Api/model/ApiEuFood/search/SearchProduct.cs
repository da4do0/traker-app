namespace Api.model
{
    public class SearchProduct
    {
        public string Code { get; set; }
        public string ProductName { get; set; }
        public string ProductNameEn { get; set; }
        public string GenericName { get; set; }
        public string Quantity { get; set; }
        public string Brands { get; set; }
        public string Countries { get; set; }
        public string IngredientsText { get; set; }
        public List<string> AllergensTags { get; set; }
        public SearchNutriments Nutriments { get; set; }
        public string NutriscoreGrade { get; set; }
        public string NovaGroup { get; set; }
        public string ImageUrl { get; set; }
        public string ImageSmallUrl { get; set; }
        public string Categories { get; set; }
        public List<string> CategoriesTags { get; set; }
        public string Packaging { get; set; }
        public string ServingSize { get; set; }
    }
}
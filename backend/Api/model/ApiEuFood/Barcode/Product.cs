using System.Text.Json.Serialization;

namespace Api.model
{
    public class Product
    {
        [JsonPropertyName("code")]
        public string? Code { get; set; }

        [JsonPropertyName("product_name")]
        public string? ProductName { get; set; }

        [JsonPropertyName("brands")]
        public string? Brands { get; set; }

        [JsonPropertyName("quantity")]
        public string? Quantity { get; set; }

        [JsonPropertyName("categories")]
        public string? Categories { get; set; }

        [JsonPropertyName("image_url")]
        public string? ImageUrl { get; set; }

        [JsonPropertyName("nutriscore_grade")]
        public string? NutriscoreGrade { get; set; }

        [JsonPropertyName("nova_group")]
        public int? NovaGroup { get; set; }

        [JsonPropertyName("serving_size")]
        public string? ServingSize { get; set; }

        [JsonPropertyName("nutriments")]
        public Nutriments? Nutriments { get; set; }

        [JsonPropertyName("ingredients_text")]
        public string? IngredientsText { get; set; }

        [JsonPropertyName("ingredients")]
        public List<Ingredient_api>? Ingredients { get; set; }

        [JsonPropertyName("allergens_tags")]
        public List<string>? AllergensTags { get; set; }
    }
}

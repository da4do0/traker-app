using System.Text.Json.Serialization;

namespace Api.model
{
    public class Ingredient_api
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
        
        [JsonPropertyName("text")]
        public string? Text { get; set; }
        
        [JsonPropertyName("percent_estimate")]
        public double? PercentEstimate { get; set; }
        
        [JsonPropertyName("vegan")]
        public string? Vegan { get; set; }
        
        [JsonPropertyName("vegetarian")]
        public string? Vegetarian { get; set; }
        
        [JsonPropertyName("from_palm_oil")]
        public string? FromPalmOil { get; set; }
        
        [JsonPropertyName("rank")]
        public int? Rank { get; set; }
    }
}

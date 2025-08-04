using System.Text.Json.Serialization;

namespace Api.model
{
    public class Nutriments
    {
        [JsonPropertyName("energy-kcal_100g")]
        public decimal? EnergyKcal100g { get; set; }

        [JsonPropertyName("proteins_100g")]
        public decimal? Proteins100g { get; set; }

        [JsonPropertyName("carbohydrates_100g")]
        public decimal? Carbohydrates100g { get; set; }

        [JsonPropertyName("fat_100g")]
        public decimal? Fat100g { get; set; }

        [JsonPropertyName("sugars_100g")]
        public decimal? Sugars100g { get; set; }

        [JsonPropertyName("fiber_100g")]
        public decimal? Fiber100g { get; set; }

        [JsonPropertyName("salt_100g")]
        public decimal? Salt100g { get; set; }

        [JsonPropertyName("sodium_100g")]
        public decimal? Sodium100g { get; set; }
    }
}

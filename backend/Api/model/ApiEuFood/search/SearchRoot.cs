using System.Text.Json.Serialization;
using Api.Converters;

namespace Api.model
{
    public class SearchRoot
    {
        [JsonPropertyName("products")]
        public List<Product>? Products { get; set; }

        [JsonPropertyName("page")]
        public int Page { get; set; }

        [JsonPropertyName("page_count")]
        public int PageCount { get; set; }

        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("page_size")]
        public int PageSize { get; set; }
    }
}

namespace Api.model
{
    public class AdvancedSearchRequest
    {
        public string query { get; set; } = string.Empty;
        public List<string>? dataTypes { get; set; }
        public int pageSize { get; set; } = 50;
        public int pageNumber { get; set; } = 1;
        public string? sortBy { get; set; } = "fdcId";
        public string? sortOrder { get; set; } = "asc";
        public string? brandOwner { get; set; }
    }
}

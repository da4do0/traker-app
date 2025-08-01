namespace Api.model
{
    public class UsdaSearchResponse
    {
        public int totalHits { get; set; }
        public int currentPage { get; set; }
        public int totalPages { get; set; }
        public List<UsdaFood>? foods { get; set; }
    }
}

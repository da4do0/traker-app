namespace Api.model
{
    public class Root
    {
        public string Status { get; set; }
        public int StatusCode { get; set; }
        public string Code { get; set; }
        public Product Product { get; set; }
    }
}

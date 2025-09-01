namespace Api.model
{
    public class BarcodeRoot
    {
        public int Status { get; set; }
        public string Code { get; set; }
        public Product Product { get; set; }
    }
}
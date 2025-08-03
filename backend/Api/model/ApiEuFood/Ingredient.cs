namespace Api.model
{
    public class Ingredient
    {
        public string Id { get; set; }
        public string Text { get; set; }
        public double? Percent { get; set; }
        public string Vegan { get; set; }
        public string Vegetarian { get; set; }
        public string FromPalmOil { get; set; }
    }
}

namespace Api.model
{
    public class SearchNutriments
    {
        // Valori per 100g
        public double? EnergyKcal100g { get; set; }
        public double? Proteins100g { get; set; }
        public double? Carbohydrates100g { get; set; }
        public double? Fat100g { get; set; }
        public double? SaturatedFat100g { get; set; }
        public double? Sugars100g { get; set; }
        public double? Salt100g { get; set; }
        public double? Sodium100g { get; set; }
        public double? Fiber100g { get; set; }
        
        // Valori per porzione (se disponibili)
        public double? EnergyKcalServing { get; set; }
        public double? ProteinsServing { get; set; }
        public double? CarbohydratesServing { get; set; }
        public double? FatServing { get; set; }
    }
}
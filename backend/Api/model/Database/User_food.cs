namespace Api.model
{
    public class UserFood
    {
        public int Id { get; set; }
        public int FoodId { get; set; }
        public int UserId { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public MealType Meal { get; set; }
        public enum MealType
        {
            Breakfast,
            Lunch,
            Dinner,
            Snack
        }
    }
}
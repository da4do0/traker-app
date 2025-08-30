namespace model.DTOs.User
{
    public class InfoUserResponse
    {
        public UserInfo userInfo { get; set; }
        public Data data { get; set; }
    }

    public class UserInfo
    {
        public float? weight { get; set; }
        public int dailyCalorieGoal { get; set; }
        public string weightGoal { get; set; }
    }

    public class Data
    {
        public List<UserFoodRecord> registra { get; set; }
        public List<FoodListItem> food { get; set; }
    }

    public class UserFoodRecord
    {
        public int Id { get; set; }
        public int FoodId { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public string Meal { get; set; }
    }

    public class FoodInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Calories { get; set; }
        public int Proteins { get; set; }
        public int Carbohydrates { get; set; }
        public int Fats { get; set; }
    }

    public class FoodListItem
    {
        public int Id { get; set; }
        public FoodInfo Food { get; set; }
        public int Quantity { get; set; }
        public DateTime Date { get; set; }
        public string Meal { get; set; }
    }
}
using Api.model;

namespace model.DTOs.Weight
{
    public class MisurationResponse
    {
        public float? TargetWeight { get; set; } //user
        public WeightGoal WeightGoal { get; set; } = WeightGoal.MaintainWeight; //user
        public PeriodMisuration[] periodMisuration { get; set; }
    }

    public class PeriodMisuration
    {
        public DateTime Date { get; set; }
        public float? Weight { get; set; }
        public float? Height { get; set; }
        public float? IMC { get; set; }
        public float? FFMI { get; set; }
    }
}
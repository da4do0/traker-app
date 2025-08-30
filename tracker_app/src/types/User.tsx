export interface User{
    nome: string;
    cognome: string;
    email: string;
    username: string;
    password: string;
    sex: Sex;
    dateofBirth: string;
    height: number;
    weight: number;
    activityLevel?: ActivityLevel;
    weightGoal?: WeightGoal;
    targetWeight?: number;
    dailyCalorieGoal?: number;
}

export type Sex = "Male" | "Female";

export const ActivityLevel = {
    Sedentary: 1,
    LightlyActive: 2,
    ModeratelyActive: 3,
    VeryActive: 4,
    ExtremelyActive: 5
} as const;

export type ActivityLevel = typeof ActivityLevel[keyof typeof ActivityLevel];

export const WeightGoal = {
    LoseWeight: 1,
    MaintainWeight: 2,
    GainWeight: 3
} as const;

export type WeightGoal = typeof WeightGoal[keyof typeof WeightGoal];
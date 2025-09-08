export interface Measurement {
    id: number;
    userId: number;
    date: string;
    weight: number;
    height: number;
    imc: number;
    ffmi: number;
}

export interface MeasurementInput {
    weight: number;
    height: number;
    date?: string;
}

export interface WeightProgress {
    currentWeight: number;
    targetWeight?: number;
    startWeight?: number;
    weightChange: number;
    progressPercentage: number;
    isOnTrack: boolean;
    daysToGoal?: number;
    weeklyAverage: number;
}

export interface BodyMetrics {
    weight: number;
    height: number;
    bmi: number;
    bmiCategory: BMICategory;
    ffmi: number;
    ffmiCategory: FFMICategory;
}

export type BMICategory = 
    | "Underweight" 
    | "Normal" 
    | "Overweight" 
    | "Obese Class I" 
    | "Obese Class II" 
    | "Obese Class III";

export type FFMICategory = 
    | "Below Average" 
    | "Average" 
    | "Above Average" 
    | "Excellent" 
    | "Superior";

export interface WeightTrend {
    period: 'week' | 'month' | 'quarter' | 'year';
    change: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    velocity: number; // kg per week
}

export interface ProgressStats {
    totalMeasurements: number;
    trackingDays: number;
    longestStreak: number;
    currentStreak: number;
    averageWeeklyChange: number;
    goalCompletionDate?: string;
}

export interface ChartDataPoint {
    date: string;
    weight: number;
    target?: number;
    isGoal?: boolean;
}

export interface WeightDataResponse {
    targetWeight: number;
    weightGoal: number;
    periodMisuration: Measurement[];
}
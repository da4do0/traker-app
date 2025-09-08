import type { 
    BMICategory, 
    FFMICategory, 
    Measurement, 
    WeightProgress, 
    BodyMetrics, 
    WeightTrend,
    ProgressStats,
    ChartDataPoint 
} from '../types/Measurement';
import type { WeightGoal } from '../types/User';

export function calculateBMI(weight: number, height: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): BMICategory {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    if (bmi < 35) return "Obese Class I";
    if (bmi < 40) return "Obese Class II";
    return "Obese Class III";
}

export function calculateFFMI(weight: number, height: number, bodyFatPercentage: number = 15): number {
    const heightInMeters = height / 100;
    const fatFreeWeight = weight * (1 - bodyFatPercentage / 100);
    return fatFreeWeight / (heightInMeters * heightInMeters);
}

export function getFFMICategory(ffmi: number, sex: 'Male' | 'Female'): FFMICategory {
    const maleThresholds = [16, 18, 20, 22];
    const femaleThresholds = [14, 16, 17, 19];
    const thresholds = sex === 'Male' ? maleThresholds : femaleThresholds;

    if (ffmi < thresholds[0]) return "Below Average";
    if (ffmi < thresholds[1]) return "Average";
    if (ffmi < thresholds[2]) return "Above Average";
    if (ffmi < thresholds[3]) return "Excellent";
    return "Superior";
}

export function calculateWeightProgress(
    measurements: Measurement[],
    targetWeight?: number,
    weightGoal?: WeightGoal
): WeightProgress {
    if (measurements.length === 0) {
        return {
            currentWeight: 0,
            targetWeight,
            weightChange: 0,
            progressPercentage: 0,
            isOnTrack: false,
            weeklyAverage: 0
        };
    }

    const sortedMeasurements = measurements.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const currentWeight = sortedMeasurements[sortedMeasurements.length - 1].weight;
    const startWeight = sortedMeasurements[0].weight;
    const weightChange = currentWeight - startWeight;

    let progressPercentage = 0;
    let isOnTrack = true;
    let daysToGoal: number | undefined;

    if (targetWeight && weightGoal) {
        const totalWeightToLose = Math.abs(targetWeight - startWeight);
        const weightLostSoFar = Math.abs(weightChange);
        progressPercentage = totalWeightToLose > 0 ? (weightLostSoFar / totalWeightToLose) * 100 : 0;

        const recentTrend = calculateWeightTrend(measurements, 'week');
        const weeklyRate = Math.abs(recentTrend.velocity);
        
        if (weeklyRate > 0) {
            const remainingWeight = Math.abs(targetWeight - currentWeight);
            daysToGoal = Math.ceil((remainingWeight / weeklyRate) * 7);
        }

        const expectedRate = weightGoal === 1 ? -0.5 : weightGoal === 3 ? 0.25 : 0;
        isOnTrack = Math.abs(recentTrend.velocity - expectedRate) < 0.3;
    }

    const recentMeasurements = measurements.slice(-4);
    const weeklyAverage = recentMeasurements.length > 1 
        ? recentMeasurements.reduce((sum, m) => sum + m.weight, 0) / recentMeasurements.length
        : currentWeight;

    return {
        currentWeight,
        targetWeight,
        startWeight,
        weightChange,
        progressPercentage: Math.min(progressPercentage, 100),
        isOnTrack,
        daysToGoal,
        weeklyAverage
    };
}

export function calculateBodyMetrics(
    weight: number, 
    height: number, 
    sex: 'Male' | 'Female'
): BodyMetrics {
    const bmi = calculateBMI(weight, height);
    const ffmi = calculateFFMI(weight, height);
    
    return {
        weight,
        height,
        bmi,
        bmiCategory: getBMICategory(bmi),
        ffmi,
        ffmiCategory: getFFMICategory(ffmi, sex)
    };
}

export function calculateWeightTrend(measurements: Measurement[], period: 'week' | 'month' | 'quarter' | 'year'): WeightTrend {
    const now = new Date();
    const periodDays = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
    };

    const cutoffDate = new Date(now.getTime() - periodDays[period] * 24 * 60 * 60 * 1000);
    const recentMeasurements = measurements.filter(m => new Date(m.date) >= cutoffDate);

    if (recentMeasurements.length < 2) {
        return {
            period,
            change: 0,
            trend: 'stable',
            velocity: 0
        };
    }

    const sortedMeasurements = recentMeasurements.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstWeight = sortedMeasurements[0].weight;
    const lastWeight = sortedMeasurements[sortedMeasurements.length - 1].weight;
    const change = lastWeight - firstWeight;

    const daysBetween = (new Date(sortedMeasurements[sortedMeasurements.length - 1].date).getTime() - 
                       new Date(sortedMeasurements[0].date).getTime()) / (24 * 60 * 60 * 1000);
    
    const velocity = daysBetween > 0 ? (change / daysBetween) * 7 : 0; // kg per week

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(change) < 0.2) {
        trend = 'stable';
    } else {
        trend = change > 0 ? 'increasing' : 'decreasing';
    }

    return {
        period,
        change,
        trend,
        velocity
    };
}

export function calculateProgressStats(measurements: Measurement[]): ProgressStats {
    if (measurements.length === 0) {
        return {
            totalMeasurements: 0,
            trackingDays: 0,
            longestStreak: 0,
            currentStreak: 0,
            averageWeeklyChange: 0
        };
    }

    const sortedMeasurements = measurements.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstDate = new Date(sortedMeasurements[0].date);
    const lastDate = new Date(sortedMeasurements[sortedMeasurements.length - 1].date);
    const trackingDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    const streaks = calculateStreaks(sortedMeasurements);
    const weeklyTrend = calculateWeightTrend(measurements, 'week');

    return {
        totalMeasurements: measurements.length,
        trackingDays,
        longestStreak: Math.max(...streaks, 0),
        currentStreak: streaks[streaks.length - 1] || 0,
        averageWeeklyChange: weeklyTrend.velocity
    };
}

function calculateStreaks(measurements: Measurement[]): number[] {
    const streaks: number[] = [];
    let currentStreak = 1;

    for (let i = 1; i < measurements.length; i++) {
        const prevDate = new Date(measurements[i - 1].date);
        const currentDate = new Date(measurements[i].date);
        const daysDiff = (currentDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);

        if (daysDiff <= 7) {
            currentStreak++;
        } else {
            streaks.push(currentStreak);
            currentStreak = 1;
        }
    }
    streaks.push(currentStreak);

    return streaks;
}

export function prepareChartData(
    measurements: Measurement[], 
    targetWeight?: number
): ChartDataPoint[] {
    const chartData: ChartDataPoint[] = measurements
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(m => ({
            date: m.date,
            weight: m.weight,
            target: targetWeight
        }));

    if (targetWeight && chartData.length > 0) {
        chartData.push({
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weight: targetWeight,
            target: targetWeight,
            isGoal: true
        });
    }

    return chartData;
}

export function formatWeight(weight: number): string {
    return `${weight.toFixed(1)} kg`;
}

export function formatBMI(bmi: number): string {
    return bmi.toFixed(1);
}

export function formatHeight(height: number): string {
    return `${height} cm`;
}

export function getMotivationalMessage(progress: WeightProgress, weightGoal?: WeightGoal): string {
    const { isOnTrack, progressPercentage, weightChange } = progress;

    if (!weightGoal) {
        return "Keep tracking your progress!";
    }

    const isLosing = weightGoal === 1;
    const isGaining = weightGoal === 3;
    const isMaintaining = weightGoal === 2;

    if (progressPercentage >= 100) {
        return "🎉 Goal achieved! Great work!";
    }

    if (isOnTrack) {
        if (progressPercentage > 75) {
            return "🔥 Almost there! Keep pushing!";
        } else if (progressPercentage > 50) {
            return "💪 Halfway there! Stay consistent!";
        } else if (progressPercentage > 25) {
            return "📈 Good progress! Keep it up!";
        } else {
            return "🌟 Great start! Stay committed!";
        }
    } else {
        if (isLosing && weightChange >= 0) {
            return "⚠️ Focus on your calorie deficit";
        } else if (isGaining && weightChange <= 0) {
            return "⚠️ Consider increasing your calories";
        } else if (isMaintaining && Math.abs(weightChange) > 2) {
            return "⚠️ Try to stabilize your routine";
        } else {
            return "💡 Adjust your approach for better results";
        }
    }
}
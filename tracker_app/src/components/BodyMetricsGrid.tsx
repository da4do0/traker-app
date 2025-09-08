import React from 'react';
import { Scale, Ruler, Activity, Zap } from 'lucide-react';
import Container from './container';
import type { BodyMetrics, WeightTrend } from '../types/Measurement';
import { formatWeight, formatBMI, formatHeight } from '../utils/weightCalculations';

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    color: string;
    trend?: WeightTrend;
}

function MetricCard({ icon, title, value, subtitle, color, trend }: MetricCardProps) {
    const getTrendIndicator = () => {
        if (!trend) return null;
        
        const trendIcon = trend.trend === 'increasing' ? '↗' : 
                         trend.trend === 'decreasing' ? '↘' : '→';
        const trendColor = trend.trend === 'stable' ? 'text-gray-400' : 
                          trend.velocity > 0 ? 'text-emerald-400' : 'text-blue-400';
        
        return (
            <div className={`text-xs ${trendColor} flex items-center gap-1`}>
                <span>{trendIcon}</span>
                <span>{Math.abs(trend.velocity).toFixed(1)} kg/sett</span>
            </div>
        );
    };

    return (
        <Container css="p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    {icon}
                </div>
                {getTrendIndicator()}
            </div>
            
            <div className="space-y-1">
                <p className="text-xs text-gray-400 font-medium">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-300">{subtitle}</p>
            </div>
        </Container>
    );
}

interface BodyMetricsGridProps {
    metrics: BodyMetrics;
    weightTrend?: WeightTrend;
    className?: string;
}

export default function BodyMetricsGrid({ metrics, weightTrend, className = "" }: BodyMetricsGridProps) {
    const { weight, height, bmi, bmiCategory, ffmi, ffmiCategory } = metrics;


    const getBMICategoryTranslation = () => {
        switch (bmiCategory) {
            case "Underweight": return "Sottopeso";
            case "Normal": return "Normale";
            case "Overweight": return "Sovrappeso";
            case "Obese Class I": return "Obesità I";
            case "Obese Class II": return "Obesità II";
            case "Obese Class III": return "Obesità III";
            default: return "";
        }
    };

    const getFFMICategoryTranslation = () => {
        switch (ffmiCategory) {
            case "Below Average": return "Sotto la media";
            case "Average": return "Nella media";
            case "Above Average": return "Sopra la media";
            case "Excellent": return "Eccellente";
            case "Superior": return "Superiore";
            default: return "";
        }
    };

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
            <MetricCard
                icon={<Scale className="w-5 h-5 text-white" />}
                title="Peso Attuale"
                value={formatWeight(weight)}
                subtitle="Ultima misurazione"
                color="bg-emerald-500/20"
                trend={weightTrend}
            />
            
            <MetricCard
                icon={<Ruler className="w-5 h-5 text-white" />}
                title="Altezza"
                value={formatHeight(height)}
                subtitle="Misurazione statica"
                color="bg-blue-500/20"
            />
            
            <MetricCard
                icon={<Activity className="w-5 h-5 text-white" />}
                title="Indice BMI"
                value={formatBMI(bmi)}
                subtitle={getBMICategoryTranslation()}
                color="bg-purple-500/20"
            />
            
            <MetricCard
                icon={<Zap className="w-5 h-5 text-white" />}
                title="FFMI"
                value={ffmi.toFixed(1)}
                subtitle={getFFMICategoryTranslation()}
                color="bg-yellow-500/20"
            />
        </div>
    );
}
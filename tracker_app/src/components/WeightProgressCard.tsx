//
import { TrendingUp, TrendingDown, Minus, Target, Calendar } from 'lucide-react';
import Container from './container';
import type { WeightProgress } from '../types/Measurement';
import type { WeightGoal } from '../types/User';
import { formatWeight, getMotivationalMessage } from '../utils/weightCalculations';

interface WeightProgressCardProps {
    progress: WeightProgress;
    weightGoal?: WeightGoal;
    className?: string;
}

export default function WeightProgressCard({ progress, weightGoal, className = "" }: WeightProgressCardProps) {
    const {
        currentWeight,
        targetWeight,
        startWeight,
        weightChange,
        progressPercentage,
        isOnTrack,
        daysToGoal
    } = progress;

    const motivationalMessage = getMotivationalMessage(progress, weightGoal);

    const getTrendIcon = () => {
        if (Math.abs(weightChange) < 0.1) {
            return <Minus className="w-5 h-5 text-gray-400" />;
        }
        return weightChange > 0 
            ? <TrendingUp className="w-5 h-5 text-emerald-400" />
            : <TrendingDown className="w-5 h-5 text-blue-400" />;
    };

    const getTrendColor = () => {
        if (!weightGoal || Math.abs(weightChange) < 0.1) return 'text-gray-400';
        
        if (weightGoal === 1) { // Lose weight
            return weightChange < 0 ? 'text-emerald-400' : 'text-red-400';
        } else if (weightGoal === 3) { // Gain weight
            return weightChange > 0 ? 'text-emerald-400' : 'text-red-400';
        }
        return 'text-gray-400'; // Maintain
    };

    const getProgressBarColor = () => {
        if (!isOnTrack) return 'bg-yellow-500';
        return progressPercentage >= 75 ? 'bg-emerald-500' : 'bg-blue-500';
    };

    const getGoalText = () => {
        if (!weightGoal) return '';
        switch (weightGoal) {
            case 1: return 'Perdere Peso';
            case 2: return 'Mantenere Peso';
            case 3: return 'Aumentare Peso';
            default: return '';
        }
    };

    return (
        <Container css={`p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Progresso Peso</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">{getGoalText()}</p>
                    {isOnTrack ? (
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-xs text-emerald-400">In linea</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs text-yellow-400">Da aggiustare</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Current Weight Display */}
            <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white mb-1">
                    {formatWeight(currentWeight)}
                </div>
                <div className={`flex items-center justify-center gap-2 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                        {weightChange > 0 ? '+' : ''}{formatWeight(Math.abs(weightChange))}
                    </span>
                    {startWeight && (
                        <span className="text-xs text-gray-400">
                            da {formatWeight(startWeight)}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {targetWeight && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Obiettivo: {formatWeight(targetWeight)}</span>
                        <span className="text-sm font-medium text-emerald-400">
                            {progressPercentage.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-300 font-medium">
                    {motivationalMessage}
                </p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                {daysToGoal && (
                    <div className="text-center">
                        <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Giorni stimati</p>
                        <p className="text-sm font-medium text-white">{daysToGoal}</p>
                    </div>
                )}
                <div className="text-center">
                    <div className="w-4 h-4 text-gray-400 mx-auto mb-1">⚡</div>
                    <p className="text-xs text-gray-400">Media settimanale</p>
                    <p className="text-sm font-medium text-white">
                        {formatWeight(progress.weeklyAverage)}
                    </p>
                </div>
            </div>
        </Container>
    );
}
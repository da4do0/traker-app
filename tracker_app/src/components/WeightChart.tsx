import { useState } from 'react';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import Container from './container';
import ButtonContainer from './ButtonContainer';
import type { ChartDataPoint } from '../types/Measurement';
import { formatWeight } from '../utils/weightCalculations';

interface WeightChartProps {
    data: ChartDataPoint[];
    className?: string;
}

type TimePeriod = '1M' | '3M' | '6M' | '1A';

export default function WeightChart({ data, className = "" }: WeightChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3M');

    const filterDataByPeriod = (period: TimePeriod) => {
        const now = new Date();
        const monthsBack = {
            '1M': 1,
            '3M': 3,
            '6M': 6,
            '1A': 12
        };

        const cutoffDate = new Date(now.getTime() - monthsBack[period] * 30 * 24 * 60 * 60 * 1000);
        return data.filter(point => new Date(point.date) >= cutoffDate);
    };

    const filteredData = filterDataByPeriod(selectedPeriod);

    if (filteredData.length === 0) {
        return (
            <Container css={`p-6 ${className}`}>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Cronologia Peso</h3>
                </div>
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Nessun dato disponibile per questo periodo</p>
                    <p className="text-sm text-gray-500 mt-1">Inizia a registrare i tuoi pesi</p>
                </div>
            </Container>
        );
    }

    const getMinMax = () => {
        const weights = filteredData.map(d => d.weight);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const padding = (max - min) * 0.1;
        return {
            min: Math.max(0, min - padding),
            max: max + padding,
            range: max - min + 2 * padding
        };
    };

    const { min, range } = getMinMax();
    const chartWidth = 100;
    const chartHeight = 60;

    const getPointPosition = (point: ChartDataPoint, index: number) => {
        const x = (index / (filteredData.length - 1)) * chartWidth;
        const y = chartHeight - ((point.weight - min) / range) * chartHeight;
        return { x, y };
    };

    const createPath = () => {
        if (filteredData.length < 2) return '';
        
        let path = '';
        filteredData.forEach((point, index) => {
            const { x, y } = getPointPosition(point, index);
            if (index === 0) {
                path += `M ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
            }
        });
        return path;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    };

    const getLatestWeight = () => {
        if (filteredData.length === 0) return null;
        const latest = filteredData[filteredData.length - 1];
        return latest;
    };

    const getWeightChange = () => {
        if (filteredData.length < 2) return null;
        const first = filteredData[0].weight;
        const last = filteredData[filteredData.length - 1].weight;
        return last - first;
    };

    const latest = getLatestWeight();
    const weightChange = getWeightChange();

    return (
        <Container css={`p-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">Cronologia Peso</h3>
                </div>
                <div className="text-right">
                    {latest && (
                        <>
                            <p className="text-sm text-gray-400">
                                {formatDate(latest.date)}
                            </p>
                            <p className="text-lg font-bold text-white">
                                {formatWeight(latest.weight)}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Period Selection */}
            <div className="flex gap-2 mb-6">
                {(['1M', '3M', '6M', '1A'] as TimePeriod[]).map((period) => (
                    <ButtonContainer
                        key={period}
                        color={selectedPeriod === period ? 'emerald' : 'gray'}
                        onClick={() => setSelectedPeriod(period)}
                        className="flex-1 py-2 text-xs"
                    >
                        {period}
                    </ButtonContainer>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
                <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-40"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                        <line
                            key={y}
                            x1="0"
                            y1={y * chartHeight / 100}
                            x2={chartWidth}
                            y2={y * chartHeight / 100}
                            stroke="#374151"
                            strokeWidth="0.5"
                            opacity="0.3"
                        />
                    ))}

                    {/* Target weight line */}
                    {filteredData.find(d => d.target) && (
                        <line
                            x1="0"
                            y1={chartHeight - ((filteredData[0].target! - min) / range) * chartHeight}
                            x2={chartWidth}
                            y2={chartHeight - ((filteredData[0].target! - min) / range) * chartHeight}
                            stroke="#10b981"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                            opacity="0.6"
                        />
                    )}

                    {/* Weight line */}
                    {filteredData.length > 1 && (
                        <path
                            d={createPath()}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className="drop-shadow-sm"
                        />
                    )}

                    {/* Data points */}
                    {filteredData.map((point, index) => {
                        const { x, y } = getPointPosition(point, index);
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="2"
                                    fill={point.isGoal ? "#10b981" : "#3b82f6"}
                                    className="drop-shadow-sm"
                                />
                                {/* Latest point highlight */}
                                {index === filteredData.length - 1 && !point.isGoal && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        opacity="0.5"
                                    />
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Stats */}
            {weightChange !== null && (
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${
                            weightChange > 0 ? 'text-emerald-400' : 'text-blue-400'
                        }`} />
                        <span className="text-gray-300">
                            Cambiamento: {weightChange > 0 ? '+' : ''}{formatWeight(Math.abs(weightChange))}
                        </span>
                    </div>
                    <span className="text-gray-400">
                        {filteredData.length} misurazioni
                    </span>
                </div>
            )}
        </Container>
    );
}
import { useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', { 
            day: '2-digit', 
            month: '2-digit',
            year: selectedPeriod === '1A' ? '2-digit' : undefined
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

    // Prepare data for MUI X Charts - only use actual measurements
    const chartData = filteredData.map(point => ({
        x: new Date(point.date).getTime(),
        weight: point.weight,
        date: point.date
    }));

    const weightData = chartData.map(point => point.weight);
    const xAxisData = chartData.map(point => point.x);
    
    // Get target from first point that has it (for the overlay line)
    const targetValue = filteredData.find(point => point.target)?.target;

    // Calculate min and max for better scaling
    const allValues = targetValue ? [...weightData, targetValue] : weightData;
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1;
    const yMin = Math.max(0, minValue - padding);
    const yMax = maxValue + padding;

    const series = [
        {
            id: 'weight',
            label: 'Peso',
            data: weightData,
            color: '#3b82f6',
            curve: 'linear' as const,
            connectNulls: true,
            showMark: true,
        }
    ];

    // Don't add target as a separate series to avoid extra points
    // The target will be shown as a reference line using yAxis configuration

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

            {/* MUI X Charts */}
            <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
                <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                    <LineChart
                        xAxis={[{
                            id: 'time',
                            data: xAxisData,
                            scaleType: 'time',
                            valueFormatter: (value: number) => {
                                return formatDate(new Date(value).toISOString());
                            },
                            tickLabelStyle: {
                                fill: '#9ca3af',
                                fontSize: 12,
                            },
                        }]}
                        yAxis={[{
                            id: 'weight',
                            min: yMin,
                            max: yMax,
                            valueFormatter: (value: number) => `${value.toFixed(1)} kg`,
                            tickLabelStyle: {
                                fill: '#9ca3af',
                                fontSize: 12,
                            },
                        }]}
                        series={series}
                        width={undefined}
                        height={300}
                        margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
                        grid={{ vertical: true, horizontal: true }}
                        sx={{
                            '& .MuiChartsAxis-root': {
                                '& .MuiChartsAxis-tickLabel': {
                                    fill: '#9ca3af',
                                },
                                '& .MuiChartsAxis-line': {
                                    stroke: '#4b5563',
                                },
                                '& .MuiChartsAxis-tick': {
                                    stroke: '#4b5563',
                                },
                            },
                            '& .MuiChartsGrid-root': {
                                '& .MuiChartsGrid-line': {
                                    stroke: '#374151',
                                    strokeOpacity: 0.3,
                                },
                            },
                            '& .MuiChartsLegend-root': {
                                '& .MuiChartsLegend-label': {
                                    fill: '#f9fafb !important',
                                },
                            },
                        }}
                    />
                    
                    {/* Target line overlay */}
                    {targetValue && (
                        <div 
                            style={{
                                position: 'absolute',
                                top: `${20 + ((yMax - targetValue) / (yMax - yMin)) * 260}px`, // Calculate position based on chart dimensions
                                left: '60px',
                                right: '20px',
                                height: '2px',
                                backgroundColor: '#10b981',
                                opacity: 0.8,
                                borderStyle: 'dashed',
                                borderWidth: '1px 0',
                                borderColor: '#10b981',
                                pointerEvents: 'none',
                                zIndex: 10,
                            }}
                        >
                            <div 
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '-10px',
                                    fontSize: '12px',
                                    color: '#10b981',
                                    backgroundColor: '#1f2937',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #10b981',
                                }}
                            >
                                Obiettivo: {formatWeight(targetValue)}
                            </div>
                        </div>
                    )}
                </div>
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
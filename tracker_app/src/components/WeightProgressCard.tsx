import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WeightProgress, WeightTrend } from '../types/Measurement';
import type { WeightGoal } from '../types/User';
import { getMotivationalMessage } from '../utils/weightCalculations';
import { Glyph, RDot, ddmm, fmt, useIsDesktop } from './ui';

interface WeightProgressCardProps {
    progress: WeightProgress;
    weightGoal?: WeightGoal;
    trend: WeightTrend;
    startDate?: string;
    single?: boolean; // una sola misurazione (quella dell'iscrizione)
    className?: string;
}

/** −3,6 · +0,4 con il segno meno tipografico */
const signed = (n: number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}${fmt(Math.abs(n), 1)}`;

export default function WeightProgressCard({ progress, weightGoal, trend, startDate, single = false, className = "" }: WeightProgressCardProps) {
    const {
        currentWeight,
        targetWeight,
        startWeight,
        weightChange,
        progressPercentage,
        isOnTrack,
        daysToGoal
    } = progress;
    const desktop = useIsDesktop();

    const motivationalMessage = getMotivationalMessage(progress, weightGoal);

    const getTrendIcon = () => {
        if (Math.abs(weightChange) < 0.1) return <Minus size={16} strokeWidth={1.75} />;
        return weightChange > 0 ? <TrendingUp size={16} strokeWidth={1.75} /> : <TrendingDown size={16} strokeWidth={1.75} />;
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

    const N = 30;
    const on = single ? 0 : Math.round((Math.min(progressPercentage, 100) / 100) * N);
    const since = startDate ? ddmm(new Date(startDate)) : "";
    const stats: [string, string][] = [
        ["GIORNI STIMATI", !single && daysToGoal ? fmt(daysToGoal) : "—"],
        [single ? "MEDIA" : "MEDIA ULTIME 4", `${fmt(progress.weeklyAverage, 1)} KG`],
        ["RITMO", single ? "—" : `${signed(trend.velocity)}/SETT`],
    ];

    return (
        <section className={`flex flex-col rounded-[28px] bg-tile p-5 pb-7 lg:h-[440px] lg:rounded-[32px] lg:p-7 lg:pt-[26px] ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="t-label text-ink2">PROGRESSO{!desktop && getGoalText() && ` · ${getGoalText()}`}</span>
                {single ? (
                    <span className="t-label">PRIMA MISURA</span>
                ) : (
                    <span className="flex items-center gap-2">
                        <span className={`size-[6px] rounded-full ${isOnTrack ? "bg-ink" : "bg-signal"}`} />
                        <span className="t-label">{isOnTrack ? "IN LINEA" : "DA AGGIUSTARE"}</span>
                    </span>
                )}
            </div>

            {/* Current Weight Display */}
            <div className="mt-[22px] flex items-end gap-[10px] lg:mt-6">
                <RDot text={fmt(currentWeight, 1)} p={[12, 14]} />
                <span className="t-label text-ink2">KG</span>
            </div>
            <div className="mt-[18px] flex items-center gap-[6px] lg:mt-[21px]">
                {single ? (
                    <span className="t-label">REGISTRATA ALL’ISCRIZIONE{since && ` · ${since}`}</span>
                ) : (
                    <>
                        {getTrendIcon()}
                        <span className="t-label">{signed(weightChange)} KG DA {fmt(startWeight ?? currentWeight, 1)}{since && ` · DAL ${since}`}</span>
                    </>
                )}
            </div>

            {/* Progress */}
            {targetWeight && (
                <>
                    <Glyph className="mt-[22px] lg:mt-5" total={N} h={desktop ? 22 : 20} gap={3} groupGap={8} groups={[{ n: on }]} />
                    <div className="t-label-s relative mt-[10px] flex justify-between text-ink2 lg:mt-3">
                        <span>{fmt(startWeight ?? currentWeight, 1)} INIZIO</span>
                        <span className={`absolute text-ink ${single ? "left-1/2 -translate-x-1/2" : ""}`}
                            style={single ? undefined : { left: `clamp(84px, ${(Math.max(on, 1) - 1) / N * 100}%, calc(100% - 150px))` }}>
                            {fmt(Math.round(progressPercentage))}%
                        </span>
                        <span>{fmt(targetWeight, 1)} OBIETTIVO</span>
                    </div>
                </>
            )}

            {/* Stats */}
            <div className="mt-5 flex justify-between border-t border-line pt-[15px] lg:grid lg:grid-cols-3 lg:pt-[17px]">
                {stats.map(([k, v]) => (
                    <div key={k}>
                        <span className="t-label-s block text-ink2">{k}</span>
                        <span className="t-data-l mt-1 block">{v}</span>
                    </div>
                ))}
            </div>

            {/* Motivational Message */}
            <p className={`t-body text-ink2 lg:mt-auto ${single ? "mt-[18px] lg:mb-1" : "mt-[22px] lg:mb-4"}`}>
                {single ? "Prima misura salvata. Pesati di nuovo tra una settimana per vedere la tendenza." : motivationalMessage}
            </p>
        </section>
    );
}

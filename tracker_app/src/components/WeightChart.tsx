import { useEffect, useRef, useState } from 'react';
import type { ChartDataPoint } from '../types/Measurement';
import { Seg, ddmm, fmt, useIsDesktop } from './ui';

interface WeightChartProps {
    data: ChartDataPoint[];
    className?: string;
}

type TimePeriod = '1M' | '3M' | '6M' | '1A';
const PERIOD: Record<TimePeriod, [string, string]> = {
    '1M': ['1 MESE', 'ULTIMO MESE'], '3M': ['3 MESI', 'ULTIMI 3 MESI'],
    '6M': ['6 MESI', 'ULTIMI 6 MESI'], '1A': ['1 ANNO', 'ULTIMO ANNO'],
};
const DAY = 24 * 60 * 60 * 1000;
const signed = (n: number) => `${n < 0 ? "−" : n > 0 ? "+" : ""}${fmt(Math.abs(n), 1)}`;

/** Grafico a punti del Figma: griglia di puntini, misure come punti, l'ultima in rosso, obiettivo tratteggiato. */
export default function WeightChart({ data, className = "" }: WeightChartProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3M');
    const desktop = useIsDesktop();
    const ref = useRef<HTMLDivElement>(null);
    const [box, setBox] = useState({ w: 0, h: 0 });
    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

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
    const single = data.length === 1;
    const latest = filteredData[filteredData.length - 1] ?? data[data.length - 1];
    const target = data.find(point => point.target)?.target;

    // ---------- geometria (px reali del riquadro misurato)
    const { w, h } = box;
    const L = desktop ? 12 : 0, R = w - (desktop ? 52 : 36), W = Math.max(1, R - L);
    const cols = Math.max(2, Math.round(W / (desktop ? 12.73 : 9.4)) + 1), colStep = W / (cols - 1);
    const rowStep = desktop ? 14.1 : 10, rows = Math.max(3, Math.floor((h - 2) / rowStep) + 1);
    const top = 1 + rowStep, bottom = 1 + (rows - 2) * rowStep;

    const times = filteredData.map(p => new Date(p.date).getTime());
    const t0 = times[0], t1 = times[times.length - 1];
    const xOf = (t: number) => L + (t1 > t0 ? ((t - t0) / (t1 - t0)) * W : 0);
    const values = [...filteredData.map(p => p.weight), ...(target ? [target] : [])];
    const max = Math.max(...values), min = Math.min(...values);
    const yOf = (v: number) => max > min ? top + ((max - v) / (max - min)) * (bottom - top) : (top + bottom) / 2;
    const pts = filteredData.map((p, i) => [xOf(times[i]), yOf(p.weight)] as const);
    const last = pts[pts.length - 1];
    const r = desktop ? 4.5 : 3.5, g = desktop ? 8 : 6;
    const yT = target ? yOf(target) : 0;

    // etichette date: ogni 2 settimane (desktop) / 4 (mobile), più l'ultima
    const step = Math.max(1, Math.ceil((t1 - t0) / DAY / (desktop ? 7 : 4) / 7)) * 7 * DAY;
    const ticks: number[] = [];
    for (let t = t0; t1 - t > step / 2; t += step) ticks.push(t);
    if (filteredData.length) ticks.push(t1);

    const label = "t-label-s fill-current";
    const seg = (
        <Seg className={desktop ? "-my-3 w-[248px]" : "mt-[14px]"} h={40} item="t-label" value={selectedPeriod} onChange={setSelectedPeriod}
            options={(['1M', '3M', '6M', '1A'] as TimePeriod[]).map(p => ({ value: p, label: p }))} />
    );
    const message = (text: string) => <p className="t-body-s mt-[13px] text-center text-ink2 lg:hidden">{text}</p>;

    return (
        <section className={`flex h-[380px] flex-col rounded-[28px] bg-tile p-5 pb-6 lg:h-[440px] lg:rounded-[32px] lg:p-7 lg:pb-[18px] lg:pt-[26px] ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="t-label text-ink2">CRONOLOGIA</span>
                {desktop && !single ? seg : latest && <span className="t-label text-ink2">ULTIMA · {ddmm(new Date(latest.date))}</span>}
            </div>
            {!desktop && !single && seg}

            {/* Griglia + punti */}
            <div ref={ref} className={`relative min-h-0 flex-1 ${single ? "mt-[35px] lg:mt-[41px]" : "mt-[27px] lg:mt-[39px]"}`}>
                {w > 0 && (
                    <svg width={w} height={h} className="absolute inset-0 overflow-visible" aria-label="Andamento del peso">
                        {Array.from({ length: rows * cols }, (_, i) => (
                            <circle key={i} cx={L + (i % cols) * colStep} cy={1 + Math.floor(i / cols) * rowStep} r={1} className="fill-dotoff" />
                        ))}
                        {filteredData.length > 0 && (
                            <>
                                {target && <line x1={L} x2={R} y1={yT} y2={yT} className="stroke-ink" strokeDasharray="4 4" />}
                                <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" className={desktop ? "stroke-ink3" : "stroke-ink2"} />
                                {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} className={i === pts.length - 1 ? "fill-signal" : "fill-ink"} />)}

                                {/* valore massimo e obiettivo a destra */}
                                {max !== target && <text x={R + g} y={top} dominantBaseline="middle" className={`${label} text-ink2`}>{fmt(max, 1)}</text>}
                                {target && (desktop
                                    ? <text x={R - 20} y={yT - g - 6} textAnchor="end" dominantBaseline="middle" className={`${label} text-ink`}>OBIETTIVO {fmt(target, 1)}</text>
                                    : <text x={R + g} y={yT} dominantBaseline="middle" className={`${label} text-ink`}>{fmt(target, 1)}</text>)}

                                {/* distanza dall'obiettivo */}
                                {target && Math.abs(yT - last[1]) > 2 * g + 4 && (
                                    <g className="text-signal">
                                        <line x1={last[0]} x2={last[0]} y1={Math.min(last[1], yT) + g} y2={Math.max(last[1], yT) - g} className="stroke-current" strokeDasharray="2 3" />
                                        <text x={single ? last[0] + (desktop ? 10 : 8) : last[0] - (desktop ? 14 : 8)} y={(last[1] + yT) / 2}
                                            textAnchor={single ? "start" : "end"} dominantBaseline="middle" className={label}>
                                            {signed(target - latest.weight)}{desktop ? " KG" : ""}
                                        </text>
                                    </g>
                                )}
                                {single && desktop && (
                                    <text x={(L + R) / 2} y={(top + bottom) / 2 - 18} textAnchor="middle" dominantBaseline="middle" className="t-body fill-current text-ink2">
                                        Serve una seconda misura per vedere la tendenza.
                                    </text>
                                )}
                            </>
                        )}
                    </svg>
                )}
                {filteredData.length === 0 && (
                    <p className="t-body absolute inset-0 flex items-center justify-center text-center text-ink2">Nessun dato disponibile per questo periodo</p>
                )}
            </div>

            {/* Date */}
            {single && message("Serve una seconda misura per la tendenza.")}
            <svg width={w} height={12} className={`shrink-0 overflow-visible ${single ? "mt-4 lg:mt-[13px]" : "mt-[13px]"}`} aria-hidden>
                {ticks.map((t, i) => {
                    const first = i === 0, end = i === ticks.length - 1;
                    const anchor = desktop || single ? "middle" : first ? "start" : end ? "end" : "middle";
                    const x = xOf(t) + (!desktop && end && !first ? 3 : 0);
                    return (
                        <text key={t} x={single && !desktop ? L : x} y={6} textAnchor={single && !desktop ? "start" : anchor} dominantBaseline="middle"
                            className={`${label} ${desktop && end ? "text-ink" : "text-ink2"}`}>
                            {ddmm(new Date(t))}
                        </text>
                    );
                })}
            </svg>

            {/* Footer */}
            {!(single && !desktop) && (
                <p className={`t-label-s mt-[22px] text-ink2 lg:mt-5 ${single ? "invisible" : ""}`}>
                    {filteredData.length} {filteredData.length === 1 ? "MISURAZIONE" : "MISURAZIONI"} · {PERIOD[selectedPeriod][desktop ? 1 : 0]}
                </p>
            )}
        </section>
    );
}

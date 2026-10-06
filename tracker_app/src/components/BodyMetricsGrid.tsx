import type { BMICategory, BodyMetrics, FFMICategory, WeightTrend } from '../types/Measurement';
import { RDot, fmt } from './ui';

export const BMI_IT: Record<BMICategory, string> = {
    "Underweight": "Sottopeso",
    "Normal": "Normale",
    "Overweight": "Sovrappeso",
    "Obese Class I": "Obesità I",
    "Obese Class II": "Obesità II",
    "Obese Class III": "Obesità III",
};

const FFMI_IT: Record<FFMICategory, string> = {
    "Below Average": "Sotto la media",
    "Average": "Nella media",
    "Above Average": "Sopra la media",
    "Excellent": "Eccellente",
    "Superior": "Superiore",
};

/** Scala BMI 15–40 divisa a 18,5 · 25 · 30: si accende la fascia, una tacca rossa segna il valore. */
export function BmiScale({ bmi, category, className = "" }: { bmi: number; category: BMICategory; className?: string }) {
    const band = ["Underweight", "Normal", "Overweight"].indexOf(category);
    const active = band < 0 ? 3 : band;
    const at = Math.min(1, Math.max(0, (bmi - 15) / 25));
    return (
        <div className={`relative flex gap-[3px] ${className}`}>
            {[3.5, 6.5, 5, 10].map((w, i) => (
                <span key={i} className={`h-[6px] rounded-full ${i === active ? "bg-ink" : "bg-dotoff"}`} style={{ flexGrow: w, flexBasis: 0 }} />
            ))}
            <span className="absolute -top-[6px] h-[18px] w-[2px] -translate-x-1/2 rounded-[1px] bg-signal" style={{ left: `${at * 100}%` }} />
        </div>
    );
}

interface BodyMetricsGridProps {
    metrics: BodyMetrics;
    weightTrend?: WeightTrend;
    className?: string;
}

/** Tile BMI e FFMI (in griglia: il genitore decide le colonne). */
export default function BodyMetricsGrid({ metrics }: BodyMetricsGridProps) {
    const { height, bmi, bmiCategory, ffmi, ffmiCategory } = metrics;
    const tile = "rounded-[28px] bg-tile p-5 h-[176px] lg:h-[200px] lg:rounded-[32px] lg:p-7 lg:pt-[26px] lg:col-span-6";
    const head = (label: string, value: number, category: string) => (
        <>
            <span className="t-label text-ink2">{label}</span>
            <div className="mt-[18px] flex items-end lg:mt-5">
                <span className="flex lg:w-48"><RDot text={fmt(value, 1)} p={[5, 7]} /></span>
                <span className="t-label hidden pb-1 lg:block">{category.toUpperCase()}</span>
            </div>
        </>
    );

    return (
        <>
            <section className={tile}>
                {head("BMI", bmi, BMI_IT[bmiCategory])}
                <BmiScale bmi={bmi} category={bmiCategory} className="mt-[14px] lg:mt-[22px]" />
                <span className="t-label-s mt-3 block lg:hidden">{BMI_IT[bmiCategory]}</span>
                <div className="mt-[10px] flex items-center border-t border-line pt-[9px] lg:mt-[26px] lg:border-0 lg:pt-0">
                    <span className="t-label-s text-ink2 lg:w-[72px]">ALTEZZA</span>
                    <span className="t-data ml-auto lg:ml-0">{fmt(height)} CM</span>
                    <span className="t-label-s ml-auto hidden text-ink2 lg:block">18,5 · 25 · 30</span>
                </div>
            </section>
            <section className={tile}>
                {head("FFMI", ffmi, FFMI_IT[ffmiCategory])}
                <span className="t-label-s mt-8 block lg:hidden">{FFMI_IT[ffmiCategory]}</span>
                <div className="mt-[10px] border-t border-line pt-[9px] lg:hidden">
                    <span className="t-label-s text-ink2">STIMA CON 15% MG</span>
                </div>
                <p className="t-body-s mt-7 hidden text-ink2 lg:block">Indice di massa magra, stimato con il 15% di massa grassa.</p>
            </section>
        </>
    );
}

import React, { useEffect, useState } from "react";
import { ChevronRight, Plus, ScanBarcode, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { APIDbHandler } from "../api/APIHandler";
import { useNavigate } from "react-router-dom";
import Shell, { PageHead } from "../components/Shell";
import { Btn, Dot, DotBar, Glyph, RDot, fmt, splitSegments, useIsDesktop, useRoll } from "../components/ui";
import type { WeightDataResponse } from "../types/Measurement";
import { calculateWeightProgress, calculateWeightTrend } from "../utils/weightCalculations";

// Pasti come arrivano da InfoUser (enum MealType del backend), in ordine canonico
const MEALS = [
  { id: "Breakfast", name: "Colazione", short: "COL" },
  { id: "Lunch", name: "Pranzo", short: "PRA" },
  { id: "Dinner", name: "Cena", short: "CEN" },
  { id: "Snack", name: "Spuntino", short: "SPU" },
];
// Aggiustamento obiettivo usato dal backend (CalorieCalculationService)
const GOAL_ADJ: Record<string, { adj: number; text: string }> = {
  LoseWeight: { adj: -500, text: "PER PERDERE PESO" },
  MaintainWeight: { adj: 0, text: "PER MANTENERE IL PESO" },
  GainWeight: { adj: 400, text: "PER AUMENTARE PESO" },
};
const tile = "rounded-[28px] bg-tile lg:rounded-[32px]";

const Home: React.FC = () => {
  // Stati per i dati dell'utente
  const [weight, setWeight] = useState(0);
  const [calories, setCalories] = useState(0); // Calorie consumate oggi
  const [totalCalories, setTotalCalories] = useState(0); // Obiettivo calorico giornaliero
  const [macros, setMacros] = useState({ carbs: 0, proteins: 0, fats: 0 }); // Macronutrienti consumati
  const [bmr, setBmr] = useState(0); // Metabolismo basale
  const [tdee, setTdee] = useState(0); // Fabbisogno energetico totale giornaliero
  const [height, setHeight] = useState(0);
  const [weightGoal, setWeightGoal] = useState("");
  const [foods, setFoods] = useState<any[]>([]); // Alimenti di oggi (InfoUser), per i pasti
  const [weightData, setWeightData] = useState<WeightDataResponse | null>(null);
  const { userId, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const desktop = useIsDesktop();

  // Recupera informazioni utente e calcola valori nutrizionali
  const getInfoUser = async () => {
    try {
      if (userId) {
        const [response, misurations] = await Promise.all([
          APIDbHandler.InfoUser(userId),
          APIDbHandler.UserMisuration(userId).catch(() => null),
        ]);
        // Imposta dati base utente
        const userWeight = response?.userInfo?.weight || 0;
        setWeight(userWeight);
        setTotalCalories(response?.userInfo?.dailyCalorieGoal);
        setWeightGoal(response?.userInfo?.weightGoal ?? "");
        setWeightData(misurations);

        // Altezza reale dall'ultima misurazione, se c'è
        const latest = [...(misurations?.periodMisuration ?? [])].sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
        const userHeight = latest?.height || 175;
        setHeight(latest?.height || 0);

        // BMR (Mifflin-St Jeor) e TDEE reale = quota − aggiustamento dell'obiettivo
        setBmr(calculateBMR(userWeight, userHeight));
        const adj = GOAL_ADJ[response?.userInfo?.weightGoal]?.adj ?? 0;
        setTdee(response?.userInfo?.dailyCalorieGoal ? response.userInfo.dailyCalorieGoal - adj : 0);

        // Calcola valori nutrizionali dai cibi consumati
        if (response?.data?.food && Array.isArray(response.data.food)) {
          const totalCaloriesConsumed = calcCalories(response.data.food);
          const macroNutrients = calcMacro(response.data.food);

          setFoods(response.data.food);
          setCalories(Math.round(totalCaloriesConsumed));
          setMacros({
            carbs: Math.round(macroNutrients.carbs),
            proteins: Math.round(macroNutrients.proteins),
            fats: Math.round(macroNutrients.fats),
          });
        } else {
          // Reset valori se non ci sono cibi
          setFoods([]);
          setCalories(0);
          setMacros({ carbs: 0, proteins: 0, fats: 0 });
        }
      }
    } catch (error) {
      console.error(
        "Errore durante il recupero delle informazioni utente:",
        error
      );
    }
  };

  // Calcola le calorie totali consumate basandosi sulla quantità
  const calcCalories = (foodData: any[]) => {
    return foodData.reduce((total: number, item: any) => {
      const consumedQuantity = item.quantity;
      const multiplier = consumedQuantity / 100; // Converti da quantità a percentuale (calorie sono per 100g)
      return total + item.food.calories * multiplier;
    }, 0);
  };

  // Calcola i macronutrienti totali (carboidrati, proteine, grassi)
  const calcMacro = (foodData: any[]) => {
    return foodData.reduce(
      (acc: any, item: any) => {
        const consumedQuantity = item.quantity;
        const multiplier = consumedQuantity / 100; // Converti da quantità a percentuale

        // Accumula macronutrienti basandosi sulla quantità consumata
        acc.carbs += item.food.carbohydrates * multiplier;
        acc.proteins += item.food.proteins * multiplier;
        acc.fats += item.food.fats * multiplier;

        return acc;
      },
      { carbs: 0, proteins: 0, fats: 0 }
    );
  };

  const calcPercentCalories = (calories: number, totalCalories: number) => {
    if (totalCalories === 0) return 0;
    return Math.round((calories / totalCalories) * 100);
  };

  // Calcola le percentuali dei macronutrienti per la visualizzazione della barra
  const calcMacroPercentages = () => {
    // Converte macronutrienti in calorie (carbs e proteine = 4kcal/g, grassi = 9kcal/g)
    const totalMacroCalories =
      macros.carbs * 4 + macros.proteins * 4 + macros.fats * 9;

    if (totalMacroCalories === 0) return { carbs: 0, proteins: 0, fats: 0 };

    // Calcola percentuale di ogni macronutriente sul totale calorico
    const percentages = {
      carbs: ((macros.carbs * 4) / totalMacroCalories) * 100,
      proteins: ((macros.proteins * 4) / totalMacroCalories) * 100,
      fats: ((macros.fats * 9) / totalMacroCalories) * 100,
    };

    return percentages;
  };

  // Calcola BMR usando la formula Mifflin-St Jeor
  const calculateBMR = (weight: number, height: number = 175, age: number = 25, gender: string = 'M') => {
    if (weight === 0) return 0;

    if (gender === 'M') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getInfoUser();
      } catch (error) {
        console.error("Errore nel caricamento calorie:", error);
      }
    };

    if (userId !== null) fetchData();
  }, [userId]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // ---------- derivazioni per la UI (solo dai dati già caricati)
  const remaining = totalCalories - calories;
  const shown = useRoll(remaining);
  const pct = calcPercentCalories(calories, totalCalories);
  const macroPct = calcMacroPercentages();
  const meals = MEALS.map((m) => {
    const items = foods.filter((f) => f.meal === m.id);
    return { ...m, count: items.length, kcal: Math.round(calcCalories(items)) };
  });
  const ordered = [...meals.filter((m) => m.count), ...meals.filter((m) => !m.count)]; // vuoti in fondo
  const eaten = meals.filter((m) => m.count);
  const N = desktop ? 50 : 34;
  const segs = splitSegments(eaten.map((m) => m.kcal), totalCalories || 1, N);

  const measurements = weightData?.periodMisuration ?? [];
  const progress = calculateWeightProgress([...measurements], weightData?.targetWeight, weightData?.weightGoal as any);
  const trend = calculateWeightTrend([...measurements], "month");
  const currentWeight = progress.currentWeight || weight;
  const goal = GOAL_ADJ[weightGoal];
  const now = new Date();

  const macroRows = [
    { short: "CARBO", long: "CARBOIDRATI", g: macros.carbs, p: macroPct.carbs },
    { short: "PROT", long: "PROTEINE", g: macros.proteins, p: macroPct.proteins },
    { short: "GRASSI", long: "GRASSI", g: macros.fats, p: macroPct.fats },
  ];

  return (
    <Shell active="oggi">
      <PageHead title="oggi" right={
        <span className="hidden gap-3 lg:flex">
          <Btn kind="secondary" className="!h-11 w-[156px]" icon={<Search size={20} />} onClick={() => navigate("/food")}>Cerca</Btn>
          <Btn kind="secondary" className="!h-11 w-[156px]" icon={<ScanBarcode size={20} />} onClick={() => navigate("/food", { state: { scan: true } })}>Scansiona</Btn>
        </span>
      } />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-6">
        {/* Kcal rimanenti + Glyph per pasto */}
        <section onClick={() => navigate("/foodList")} className={`${tile} col-span-2 cursor-pointer px-5 pb-[26px] pt-[22px] lg:col-span-8 lg:h-[400px] lg:px-8 lg:pb-0 lg:pt-7`}>
          <div className="flex justify-between">
            <span className="t-label text-ink2">KCAL RIMANENTI</span>
            <span className="t-label hidden text-ink2 lg:block">{String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}</span>
          </div>
          <div className="mt-6 flex lg:mt-7">
            <div className={`flex items-end gap-3 lg:gap-[14px] ${remaining < 0 ? "text-signal" : ""}`}>
              <RDot text={fmt(shown)} p={[16, 24]} />
              <span className="t-label pb-[2px] text-ink2 lg:pb-[11px]">KCAL</span>
            </div>
            <dl className="ml-auto hidden w-[200px] lg:block">
              {[["MANGIATE", fmt(calories)], ["PASTI REGISTRATI", `${eaten.length} DI 4`], ["USATA", `${pct}%`]].map(([k, v], i) => (
                <div key={k} className={`pb-[10px] ${i ? "border-t border-line pt-[11px]" : "pt-[6px]"}`}>
                  <dt className="t-label-s text-ink2">{k}</dt>
                  <dd className="t-data-l mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Glyph className="mt-[25px] lg:mt-[68px]" total={N} h={desktop ? 26 : 22} gap={desktop ? 2.9 : 3} groupGap={desktop ? 18 : 14}
            groups={eaten.map((m, i) => ({
              n: segs[i],
              label: (
                <span className="mt-[10px] whitespace-nowrap lg:mt-[14px]">
                  <span className="t-label-s block text-ink2">{desktop ? m.name.toUpperCase() : m.short}</span>
                  <span className="t-data mt-[2px] block">{fmt(m.kcal)}{desktop ? " KCAL" : ""}</span>
                </span>
              ),
            }))}
            free={<span className="t-label-s mt-[10px] whitespace-nowrap text-ink2 lg:mt-[14px]">LIBERE</span>} />
          <div className="mt-[22px] flex items-center justify-between border-t border-line pt-[17px] lg:hidden">
            <span className="t-data">{fmt(calories)} MANGIATE</span>
            <span className="t-label text-ink2">{pct}% DELLA QUOTA</span>
          </div>
        </section>

        {/* Cerca / Scansiona (mobile) */}
        <Btn kind="secondary" className="!h-12 lg:!hidden" icon={<Search size={20} />} onClick={() => navigate("/food")}>Cerca</Btn>
        <Btn kind="secondary" className="!h-12 lg:!hidden" icon={<ScanBarcode size={20} />} onClick={() => navigate("/food", { state: { scan: true } })}>Scansiona</Btn>

        {/* Peso */}
        <section onClick={() => navigate("/weight")} className={`${tile} flex h-[216px] cursor-pointer flex-col px-5 pt-5 lg:col-span-4 lg:h-[400px] lg:px-7 lg:pt-7`}>
          <div className="flex items-center justify-between">
            <span className="t-label text-ink2">PESO</span>
            {measurements.length > 1 && (
              <span className="t-label-s lg:t-label flex items-center gap-[2px] text-ink">
                {trend.velocity < 0 ? <TrendingDown size={14} strokeWidth={2} /> : <TrendingUp size={14} strokeWidth={2} />}
                {fmt(Math.abs(trend.velocity), 1)}{desktop ? " KG" : ""}/SETT
              </span>
            )}
          </div>
          <div className="mt-4 flex items-end gap-[6px] lg:mt-[22px]">
            <RDot text={fmt(currentWeight, 1)} p={[6, 9]} />
            <span className="t-label-s lg:t-label pb-[2px] text-ink2">KG</span>
          </div>
          <MiniChart values={[...measurements].sort((a, b) => +new Date(a.date) - +new Date(b.date)).map((m) => m.weight)} desktop={desktop} />
          {measurements.length > 0 && desktop && (
            <div className="mt-1 flex justify-between">
              <span className="t-label-s text-ink2">{ddmmOf(measurements, "first")}</span>
              <span className="t-label-s text-ink2">{ddmmOf(measurements, "last")}</span>
            </div>
          )}
          {weightData?.targetWeight ? (
            <>
              <span className="t-label-s mt-auto mb-[22px] whitespace-nowrap lg:hidden">OBIETTIVO {fmt(weightData.targetWeight, 1)} · {Math.round(progress.progressPercentage)}%</span>
              <div className="mt-auto mb-7 hidden gap-[46px] border-t border-line pt-[15px] lg:flex">
                <div><div className="t-label-s text-ink2">OBIETTIVO</div><div className="t-data mt-1">{fmt(weightData.targetWeight, 1)} KG · {Math.round(progress.progressPercentage)}%</div></div>
                {progress.daysToGoal ? <div><div className="t-label-s text-ink2">STIMA</div><div className="t-data mt-1">{progress.daysToGoal} GIORNI</div></div> : null}
              </div>
            </>
          ) : null}
        </section>

        {/* Quota */}
        <section className={`${tile} flex h-[216px] flex-col px-5 pt-5 lg:order-last lg:col-span-4 lg:hidden`}>
          <span className="t-label text-ink2">LA TUA QUOTA</span>
          <dl className="mt-4 flex flex-col gap-[6px]">
            <Row k="BMR" v={fmt(bmr)} />
            <Row k={`× ${bmr ? fmt(tdee / bmr, 2) : "–"} TDEE`} v={fmt(tdee)} />
            <Row k="OBIETTIVO" v={goal ? (goal.adj > 0 ? "+" : goal.adj < 0 ? "−" : "") + fmt(Math.abs(goal.adj)) : "–"} />
          </dl>
          <div className="mt-[10px] border-t border-line pt-[13px]"><Dot text={fmt(totalCalories)} p={4.4} /></div>
          <span className="t-label-s mt-5 text-ink2">KCAL AL GIORNO</span>
        </section>

        {/* Macro */}
        <section className={`${tile} col-span-2 px-5 pb-[22px] pt-5 lg:col-span-4 lg:h-[300px] lg:px-7 lg:pt-7`}>
          <div className="flex justify-between">
            <span className="t-label text-ink2">MACRO</span>
            <span className="t-label-s text-ink2">% ENERGIA<span className="lg:hidden"> · GRAMMI</span></span>
          </div>
          <div className="mt-[22px] flex flex-col gap-4 lg:mt-[30px] lg:gap-[30px]">
            {macroRows.map((r) => (
              <div key={r.short}>
                <div className="flex items-center lg:hidden">
                  <span className="t-label w-[68px] text-ink2">{r.short}</span>
                  <DotBar n={16} on={Math.round((r.p / 100) * 16)} />
                  <span className="t-label ml-auto text-ink2">{Math.round(r.p)}%</span>
                  <span className="t-data w-[60px] text-right">{r.g} G</span>
                </div>
                <div className="hidden lg:block">
                  <div className="flex items-end justify-between">
                    <span className="t-label text-ink2">{r.long}</span>
                    <span className="t-data-l">{r.g} G</span>
                  </div>
                  <div className="mt-[6px] flex items-center justify-between">
                    <DotBar n={20} on={Math.round((r.p / 100) * 20)} size={7.5} gap={4.5} />
                    <span className="t-label">{Math.round(r.p)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Come nasce la quota (desktop) */}
        <section className={`${tile} hidden h-[300px] px-7 pt-7 lg:col-span-4 lg:block`}>
          <span className="t-label text-ink2">COME NASCE LA QUOTA</span>
          <ol className="mt-[30px] flex flex-col">
            {[
              { k: "BMR", v: bmr, sub: `MIFFLIN-ST JEOR · ${fmt(currentWeight, 1)} KG${height ? ` · ${height} CM` : ""}` },
              { k: "TDEE", v: tdee, sub: `× ${bmr ? fmt(tdee / bmr, 2) : "–"} SUL BMR` },
              { k: "QUOTA", v: totalCalories, sub: goal ? `${goal.adj < 0 ? "−" : "+"} ${fmt(Math.abs(goal.adj))} ${goal.text}` : "" },
            ].map((s, i) => (
              <li key={s.k} className="relative flex gap-4 pb-[26px]">
                <span className={`relative mt-2 size-[10px] shrink-0 rounded-full ${i === 2 ? "bg-signal" : "bg-ink"}`} />
                {i < 2 && <span className="absolute left-[4.5px] top-[22px] h-[46px] border-l border-dashed border-ink3" />}
                <div className="flex-1">
                  <div className="flex justify-between"><span className="t-label text-ink2">{s.k}</span><span className="t-data-l">{fmt(s.v)}</span></div>
                  <div className="t-label-s mt-[2px] text-ink2">{s.sub}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Pasti */}
        <section className={`${tile} col-span-2 px-5 pt-5 lg:col-span-4 lg:h-[300px] lg:px-7 lg:pt-7`}>
          <div className="flex items-center justify-between">
            <span className="t-label text-ink2">PASTI</span>
            <button onClick={() => navigate("/foodList")} className="t-label flex cursor-pointer items-center gap-1">DIARIO <ChevronRight size={14} /></button>
          </div>
          <ul className="mt-5 lg:mt-[22px]">
            {ordered.map((m, i) => (
              <li key={m.id} className={`flex items-center py-[10px] lg:py-[9px] ${i ? "border-t border-line" : ""}`}>
                <div className="flex-1">
                  <div className="t-strong">{m.name}</div>
                  <div className="t-label-s mt-[2px] text-ink2">{m.count ? `${m.count} ALIMENT${m.count === 1 ? "O" : "I"}` : "VUOTO"}</div>
                </div>
                {m.count ? (
                  <button onClick={() => navigate("/foodList")} className="t-data flex cursor-pointer items-center gap-[10px]">
                    {fmt(m.kcal)} KCAL <ChevronRight size={14} className="text-ink2 lg:hidden" />
                  </button>
                ) : (
                  <button onClick={() => navigate("/food")} className="t-label flex cursor-pointer items-center gap-2">AGGIUNGI <Plus size={14} /></button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-baseline justify-between"><dt className="t-label-s text-ink2">{k}</dt><dd className="t-data">{v}</dd></div>
);

const ddmmOf = (ms: { date: string }[], which: "first" | "last") => {
  const sorted = [...ms].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const d = new Date((which === "first" ? sorted[0] : sorted[sorted.length - 1]).date);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Mini grafico a punti: griglia spenta, misure bianche, ultima in rosso. */
function MiniChart({ values, desktop }: { values: number[]; desktop: boolean }) {
  const cols = 14, rows = desktop ? 9 : 6;
  const pts = values.slice(-cols);
  const min = Math.min(...pts), max = Math.max(...pts);
  const W = desktop ? 293 : 125, H = desktop ? 115 : 50;
  const cx = (c: number) => (c * (W - 3)) / (cols - 1) + 1.5, cy = (r: number) => (r * (H - 3)) / (rows - 1) + 1.5;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-[22px] w-full overflow-visible lg:mt-[37px]" aria-hidden>
      {Array.from({ length: cols * rows }, (_, i) => <circle key={i} cx={cx(i % cols)} cy={cy(Math.floor(i / cols))} r={desktop ? 1.5 : 1.2} className="fill-dotoff" />)}
      {pts.map((w, i) => {
        const c = pts.length > 1 ? Math.round((i * (cols - 1)) / (pts.length - 1)) : 0;
        const r = max > min ? Math.round(((max - w) / (max - min)) * (rows - 1)) : Math.floor(rows / 2);
        return <circle key={i} cx={cx(c)} cy={cy(r)} r={desktop ? 4 : 3} className={i === pts.length - 1 ? "fill-signal" : "fill-ink"} />;
      })}
    </svg>
  );
}

export default Home;

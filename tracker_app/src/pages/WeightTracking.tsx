import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Shell, { PageHead } from "../components/Shell";
import { Btn, ErrorBanner, fmt, useIsDesktop } from "../components/ui";
import WeightProgressCard from "../components/WeightProgressCard";
import BodyMetricsGrid from "../components/BodyMetricsGrid";
import WeightChart from "../components/WeightChart";
import AddMeasurementModal from "../components/AddMeasurementModal";
import type {
  Measurement,
  MeasurementInput,
  WeightProgress,
  BodyMetrics,
  WeightTrend,
  ChartDataPoint,
  WeightDataResponse,
} from "../types/Measurement";
import type { User, WeightGoal } from "../types/User";
import {
  calculateWeightProgress,
  calculateBodyMetrics,
  calculateWeightTrend,
  calculateProgressStats,
} from "../utils/weightCalculations";
import { useUser } from "../hooks/UserInfo";
import { APIDbHandler } from "../api/APIHandler";

// Default user data - will be updated with API data
const defaultUser: User = {
  nome: "",
  cognome: "",
  email: "",
  username: "",
  password: "",
  sex: "Male",
  dateofBirth: "",
  height: 175,
  weight: 80,
  weightGoal: 1,
  targetWeight: 75,
  dailyCalorieGoal: 2000,
};

export default function WeightTracking() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [user, setUser] = useState<User>(defaultUser);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useUser();

  // Calculate derived data
  const progress: WeightProgress = calculateWeightProgress(
    measurements,
    user.targetWeight,
    user.weightGoal
  );

  const latestMeasurement =
    measurements.length > 0
      ? measurements.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : null;

  const bodyMetrics: BodyMetrics = latestMeasurement
    ? calculateBodyMetrics(
        latestMeasurement.weight,
        latestMeasurement.height,
        user.sex
      )
    : calculateBodyMetrics(user.weight, user.height, user.sex);

  const weightTrend: WeightTrend = calculateWeightTrend(measurements, "month");
  const chartData: ChartDataPoint[] = measurements
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      date: m.date,
      weight: m.weight,
      target: user.targetWeight
    }));

  // Handle adding new measurement
  const handleAddMeasurement = async (measurementInput: MeasurementInput) => {
    if (!userId) {
      setError("Utente non valido. Riprova.");
      return;
    }

    setError(null);

    try {
      // Calculate BMI and FFMI for the new measurement
      const bodyMetrics = calculateBodyMetrics(
        measurementInput.weight,
        measurementInput.height,
        user.sex
      );

      const newMeasurement: Measurement = {
        id: 0, // Will be set by the backend
        userId: userId,
        date: measurementInput.date || new Date().toISOString(),
        weight: measurementInput.weight,
        height: measurementInput.height,
        imc:
          measurementInput.weight / Math.pow(measurementInput.height / 100, 2),
        ffmi: bodyMetrics.ffmi,
      };

      // Call the API to add the measurement
      await APIDbHandler.AddUserMisuration(newMeasurement);

      setIsAddModalOpen(false);

      // Refresh data from API to get the updated list
      await getMisuration(userId);
    } catch (err) {
      setError("Errore nel salvare la misurazione. Riprova.");
      console.error("Error adding measurement:", err);
    }
  };

  const getGoalText = () => {
    switch (user.weightGoal) {
      case 1:
        return "Perdere peso";
      case 2:
        return "Mantenere peso";
      case 3:
        return "Aumentare peso";
      default:
        return "Obiettivo non impostato";
    }
  };

  const getMisuration = async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: WeightDataResponse = await APIDbHandler.UserMisuration(
        userId
      );

      // Update measurements from API
      setMeasurements(response.periodMisuration || []);

      // Update user data with API values
      setUser((prevUser) => ({
        ...prevUser,
        targetWeight: response.targetWeight,
        weightGoal: response.weightGoal as WeightGoal,
      }));
    } catch (err) {
      console.error("Error fetching weight data:", err);
      setError("Errore nel caricamento dei dati. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getMisuration(userId);
    }
  }, [userId]);

  // ---------- UI
  const desktop = useIsDesktop();
  const single = measurements.length === 1;
  const trackingDays = calculateProgressStats(measurements).trackingDays;
  const summary: [string, string, string][] = [
    ["MISURAZIONI", "MISURAZIONI", fmt(measurements.length)],
    ["GIORNI", "GIORNI TRACCIATI", fmt(trackingDays)],
    ["TREND 30G", "TREND 30 GIORNI", single ? "—" : `${weightTrend.change < 0 ? "−" : weightTrend.change > 0 ? "+" : ""}${fmt(Math.abs(weightTrend.change), 1)} KG`],
  ];
  const add = desktop ? (
    <Btn icon={<Plus size={20} strokeWidth={2} />} onClick={() => setIsAddModalOpen(true)} className="!h-12 w-[236px]">Nuova misurazione</Btn>
  ) : (
    <Btn size="M" icon={<Plus size={20} strokeWidth={2} />} onClick={() => setIsAddModalOpen(true)} className="!h-9 w-[118px]">Misura</Btn>
  );

  return (
    <Shell active="peso">
      <PageHead title="peso" date={false} right={add}>
        <span className="t-label hidden pb-[10px] lg:block">{getGoalText().toUpperCase()}</span>
      </PageHead>

      {/* Error Display */}
      {error && <div className="mb-3"><ErrorBanner onDismiss={() => setError(null)}>{error}</ErrorBanner></div>}

      {isLoading ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="size-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          <p className="t-title mt-6">Caricamento dati...</p>
          <p className="t-body mt-2 text-ink2">Stiamo recuperando le tue misurazioni</p>
        </div>
      ) : measurements.length === 0 ? (
        <section className="flex flex-col items-center rounded-[28px] bg-tile px-5 py-12 text-center lg:rounded-[32px]">
          <h3 className="t-title">Inizia a tracciare il tuo peso</h3>
          <p className="t-body mt-2 max-w-md text-ink2">Registra le tue misurazioni per vedere i progressi verso il tuo obiettivo</p>
          <Btn icon={<Plus size={20} strokeWidth={2} />} onClick={() => setIsAddModalOpen(true)} className="mt-6">Prima misurazione</Btn>
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-6">
          {/* Progress Overview */}
          <WeightProgressCard
            className="col-span-2 lg:col-span-5"
            progress={progress}
            weightGoal={user.weightGoal}
            trend={weightTrend}
            startDate={chartData[0]?.date}
            single={single}
          />

          {/* Weight Chart (su mobile dopo BMI/FFMI) */}
          <WeightChart className="order-1 col-span-2 lg:order-none lg:col-span-7" data={chartData} />

          {/* Body Metrics */}
          <BodyMetricsGrid metrics={bodyMetrics} weightTrend={weightTrend} />

          {/* Riepilogo */}
          <section className="order-2 col-span-2 grid h-[104px] grid-cols-3 rounded-[28px] bg-tile px-5 pt-[22px] lg:order-none lg:col-span-12 lg:h-[120px] lg:grid-cols-[320px_344px_1fr] lg:items-center lg:rounded-[32px] lg:px-8 lg:pt-0">
            {summary.map(([short, long, value], i) => (
              <div key={long} className={`lg:h-16 lg:pt-1 ${i ? "lg:border-l lg:border-line lg:pl-6" : ""}`}>
                <span className="t-label-s block text-ink2">{desktop ? long : short}</span>
                <span className="t-data-l mt-2 block">{value}</span>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* Add Measurement Modal: montato all'apertura, così parte dall'ultima misura */}
      {isAddModalOpen && (
        <AddMeasurementModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddMeasurement}
          currentWeight={latestMeasurement?.weight || user.weight}
          currentHeight={latestMeasurement?.height || user.height}
        />
      )}
    </Shell>
  );
}

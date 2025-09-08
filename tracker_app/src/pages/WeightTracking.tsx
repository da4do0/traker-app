import { useState, useEffect } from "react";
import { Plus, BarChart3, Target, TrendingUp, AlertCircle } from "lucide-react";
import Header from "../components/Header";
import ButtonContainer from "../components/ButtonContainer";
import WeightProgressCard from "../components/WeightProgressCard";
import BodyMetricsGrid from "../components/BodyMetricsGrid";
import WeightChart from "../components/WeightChart";
import AddMeasurementModal from "../components/AddMeasurementModal";
import ErrorDisplay from "../components/ErrorDisplay";
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
  prepareChartData,
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
  const chartData: ChartDataPoint[] = prepareChartData(
    measurements,
    user.targetWeight
  );

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
        return "Perdita di peso";
      case 2:
        return "Mantenimento peso";
      case 3:
        return "Aumento di peso";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-emerald-400" />
              Monitoraggio Peso
            </h1>
            <p className="text-gray-400 text-sm mt-1">{getGoalText()}</p>
          </div>
          <ButtonContainer
            color="emerald"
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-row items-center gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi Peso</span>
          </ButtonContainer>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Caricamento dati...
            </h3>
            <p className="text-gray-400">
              Stiamo recuperando le tue misurazioni
            </p>
          </div>
        ) : measurements.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Inizia a tracciare il tuo peso
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Registra le tue misurazioni per vedere i progressi verso il tuo
              obiettivo
            </p>
            <ButtonContainer
              color="emerald"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3"
            >
              <Plus className="w-5 h-5" />
              Prima Misurazione
            </ButtonContainer>
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <WeightProgressCard
              progress={progress}
              weightGoal={user.weightGoal}
            />

            {/* Body Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Metriche Corporee
              </h2>
              <BodyMetricsGrid
                metrics={bodyMetrics}
                weightTrend={weightTrend}
              />
            </div>

            {/* Weight Chart */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Cronologia
              </h2>
              <WeightChart data={chartData} />
            </div>

            {/* Recent Measurements Summary */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h3 className="text-md font-semibold text-white mb-3">
                Riepilogo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Misurazioni</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {measurements.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Trend Mensile</p>
                  <p className="text-lg font-bold text-blue-400">
                    {weightTrend.change > 0 ? "+" : ""}
                    {weightTrend.change.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">All'obiettivo</p>
                  <p className="text-lg font-bold text-purple-400">
                    {user.targetWeight
                      ? `${Math.abs(
                          progress.currentWeight - user.targetWeight
                        ).toFixed(1)} kg`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Progresso</p>
                  <p className="text-lg font-bold text-yellow-400">
                    {progress.progressPercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddMeasurement}
        currentWeight={latestMeasurement?.weight || user.weight}
        currentHeight={latestMeasurement?.height || user.height}
      />
    </div>
  );
}

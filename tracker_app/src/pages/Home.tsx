import React, { useEffect, useState } from "react";
import {
  UserCircle,
  Plus,
  Droplet,
  CupSoda,
  Scale,
  BarChart2,
  Utensils,
} from "lucide-react";
import Container from "../components/container";
import ButtonContainer from "../components/ButtonContainer";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";
import { APIDbHandler } from "../api/APIHandler";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  // Stati per i dati dell'utente
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState(0); // Calorie consumate oggi
  const [totalCalories, setTotalCalories] = useState(0); // Obiettivo calorico giornaliero
  const [macros, setMacros] = useState({ carbs: 0, proteins: 0, fats: 0 }); // Macronutrienti consumati
  const { userId, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Recupera informazioni utente e calcola valori nutrizionali
  const getInfoUser = async () => {
    try {
      if (userId) {
        const response = await APIDbHandler.InfoUser(userId);
        // Imposta dati base utente
        setWeight(response?.userInfo?.weight);
        setTotalCalories(response?.userInfo?.dailyCalorieGoal);

        // Calcola valori nutrizionali dai cibi consumati
        if (response?.data?.food && Array.isArray(response.data.food)) {
          const totalCaloriesConsumed = calcCalories(response.data.food);
          const macroNutrients = calcMacro(response.data.food);

          setCalories(Math.round(totalCaloriesConsumed));
          setMacros({
            carbs: Math.round(macroNutrients.carbs),
            proteins: Math.round(macroNutrients.proteins),
            fats: Math.round(macroNutrients.fats),
          });
        } else {
          // Reset valori se non ci sono cibi
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-2 md:p-6">
      {/* Header */}

      <Header />

      {/* Azioni rapide */}
      <section className="grid grid-cols-2 gap-4 mb-6">
        <ButtonContainer color="emerald" link="food">
          <Plus className="text-emerald-400 mb-1" />
          <span className="text-emerald-200 text-sm">Alimento</span>
        </ButtonContainer>

        {/*<ButtonContainer color="yellow" link="">
          <CupSoda className="text-yellow-300 mb-1" />
          <span className="text-yellow-200 text-sm">Bevanda</span>
        </ButtonContainer>

         <ButtonContainer color="blue" link="">
          <Droplet className="text-blue-300 mb-1" />
          <span className="text-blue-200 text-sm">Acqua</span>
        </ButtonContainer> */}

        <ButtonContainer color="purple" onClick={() => navigate("/weight")}>
          <Scale className="text-purple-300 mb-1" />
          <span className="text-purple-200 text-sm">Peso</span>
        </ButtonContainer>
      </section>

      {/* Cards principali */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Nutrizione */}
        <Container onClick={() => navigate("/foodList")} css="cursor-pointer">
          <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
            <Utensils className="w-5 h-5" />
            Nutrizione Oggi
            <span className="ml-auto text-xs text-gray-400 font-normal">
              {calcPercentCalories(calories, totalCalories)}%
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{calories}</div>
          {/* Barra di progresso segmentata per macronutrienti */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden flex">
            {(() => {
              const macroPercentages = calcMacroPercentages();
              return (
                <div
                  className="h-full rounded-full flex overflow-hidden"
                  style={{
                    width: `${calcPercentCalories(calories, totalCalories)}%`, // Larghezza totale basata su % obiettivo calorico
                  }}
                >
                  {/* Sezione carboidrati - blu */}
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${macroPercentages.carbs}%` }}
                    title={`Carboidrati: ${
                      macros.carbs
                    }g (${macroPercentages.carbs.toFixed(1)}%)`}
                  ></div>
                  {/* Sezione proteine - rosso */}
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${macroPercentages.proteins}%` }}
                    title={`Proteine: ${
                      macros.proteins
                    }g (${macroPercentages.proteins.toFixed(1)}%)`}
                  ></div>
                  {/* Sezione grassi - giallo */}
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${macroPercentages.fats}%` }}
                    title={`Grassi: ${
                      macros.fats
                    }g (${macroPercentages.fats.toFixed(1)}%)`}
                  ></div>
                </div>
              );
            })()}
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>di {totalCalories} kcal</span>
          </div>
          {calories > 0 && (
            <div className="flex gap-4 text-xs text-gray-400 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Carbo {macros.carbs}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Prot {macros.proteins}g</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Grassi {macros.fats}g</span>
              </div>
            </div>
          )}
        </Container>

        {/* Idratazione */}
        {/*  <Container>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <Droplet className="w-5 h-5" />
            Idratazione Totale
            <span className="ml-auto text-xs text-gray-400 font-normal">
              0%
            </span>
          </div>
          <div className="text-3xl font-bold text-white">0ml</div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: "0%" }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>di 2555ml</span>
          </div>
        </Container> */}

        {/* Peso */}
        <Container onClick={() => navigate("/weight")} css="cursor-pointer">
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-lg">
            <Scale className="w-5 h-5" />
            Peso & Andamento
          </div>
          <div className="text-3xl font-bold text-white">{weight}kg</div>
          <div className="text-xs text-gray-400">Peso attuale</div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/weight");
              }}
              className="bg-gray-800 border border-gray-700 hover:bg-purple-900 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all"
            >
              <Scale className="w-4 h-4" /> Vai al monitoraggio
            </button>
            <span className="text-xs text-gray-500">Traccia i progressi</span>
          </div>
        </Container>

        {/* Metabolismo */}
        <Container>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-lg">
            <BarChart2 className="w-5 h-5" />
            Metabolismo
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm text-gray-300">
              <span>TDEE (Fabbisogno totale)</span>
              <span className="font-bold text-white">2456 kcal</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>BMR (Metabolismo basale)</span>
              <span className="font-bold text-white">1786 kcal</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Il TDEE è il tuo fabbisogno calorico giornaliero totale, calcolato
            in base al tuo metabolismo basale e livello di attività.
          </div>
        </Container>
      </section>

      {/* Footer mobile (placeholder) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex justify-around items-center py-2 md:hidden z-20">
        <button className="flex flex-col items-center text-emerald-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12h18M3 6h18M3 18h18"
            />
          </svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
            />
          </svg>
          <span className="text-xs">Diario</span>
        </button>
        <button className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-lg -mt-8 border-4 border-gray-950">
          <Plus className="w-7 h-7" />
        </button>
        <button
          onClick={() => navigate("/weight")}
          className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
        >
          <Scale className="w-6 h-6" />
          <span className="text-xs">Peso</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <UserCircle className="w-6 h-6" />
          <span className="text-xs">Profilo</span>
        </button>
      </footer>
    </div>
  );
};

export default Home;

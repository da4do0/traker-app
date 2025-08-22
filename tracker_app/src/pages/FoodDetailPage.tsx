import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Container from "../components/container";
import { ArrowLeft, Plus, Info, AlertTriangle, Award, Zap, Scale, Clock } from "lucide-react";
import type { FoodDetailHover } from "../interfaces/Food";

const FoodDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const food = location.state?.food as FoodDetailHover;

  if (!food) {
    navigate("/food");
    return null;
  }

  const getNutritionGradeColor = (grade: string) => {
    const gradeColors = {
      a: "bg-green-500 text-white",
      b: "bg-lime-500 text-white",
      c: "bg-yellow-500 text-black",
      d: "bg-orange-500 text-white",
      e: "bg-red-500 text-white",
    };
    return gradeColors[grade?.toLowerCase() as keyof typeof gradeColors] || "bg-gray-500 text-white";
  };

  const getNovaGroupColor = (group: number) => {
    const colors = {
      1: "bg-green-500 text-white",
      2: "bg-yellow-500 text-black",
      3: "bg-orange-500 text-white",
      4: "bg-red-500 text-white",
    };
    return colors[group as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const getMainCategory = (categories: string) => {
    const categoryList = categories?.split(",");
    return categoryList[categoryList?.length - 1]?.replace("en:", "").trim() || "Alimento";
  };

  const formatAllergens = (allergens: string[]) => {
    if (!allergens || allergens.length === 0) return "Nessun allergene specificato";
    return allergens.join(", ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-2 md:p-6">
      <Header />
      
      <main className="flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Torna alla ricerca</span>
            </button>
          </div>

          {/* Main Food Details */}
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-800">
                  <img
                    src={food?.imageUrl}
                    alt={food?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiByeD0iMjAiIGZpbGw9IiMzNzQxNTEiLz4KPHN2ZyB4PSIxNzUiIHk9IjE3NSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMlMyMiAxNy41MiAyMiAxMlMxNy41MiAyIDEyIDJaTTEzIDE3SDExVjE1SDEzVjE3Wk0xMyAxM0gxMVY3SDEzVjEzWiIgZmlsbD0iIzZCNzI4NSIvPgo8L3N2Zz4KPC9zdmc+";
                    }}
                  />
                </div>

                {/* Nutrition Scores */}
                <div className="flex gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getNutritionGradeColor(food.nutritionGrade)}`}>
                    <Award size={20} />
                    <div>
                      <div className="font-bold">Nutri-Score</div>
                      <div className="text-sm">{food?.nutritionGrade?.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getNovaGroupColor(food.novaGroup)}`}>
                    <Zap size={20} />
                    <div>
                      <div className="font-bold">Nova Group</div>
                      <div className="text-sm">{food?.novaGroup}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Product Info */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{food?.name}</h1>
                  <p className="text-xl text-gray-300 mb-2">{food?.brands}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{food?.quantity}</span>
                    <span>•</span>
                    <span>{getMainCategory(food?.categories)}</span>
                  </div>
                </div>

                {/* Add to Diary Button */}
                <button className="w-full bg-green-600 hover:bg-green-700 transition-colors rounded-lg p-4 flex items-center justify-center gap-2">
                  <Plus size={20} className="text-white" />
                  <span className="text-white font-semibold text-lg">Aggiungi al Diario</span>
                </button>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{food?.nutrition?.calories100g}</div>
                    <div className="text-sm text-gray-400">kcal per 100g</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="text-lg text-white">{food?.servingSize}</div>
                    <div className="text-sm text-gray-400">Porzione</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* Nutrition Facts */}
          <Container css="mt-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-900/50 rounded-lg w-fit p-2">
                <Scale color="blue" />
              </div>
              <h2 className="text-xl font-semibold text-white">Valori Nutrizionali (per 100g)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{food?.nutrition?.protein100g}g</div>
                <div className="text-gray-300">Proteine</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-400">{food?.nutrition?.carbs100g}g</div>
                <div className="text-gray-300">Carboidrati</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{food?.nutrition?.fat100g}g</div>
                <div className="text-gray-300">Grassi</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{food?.nutrition?.calories100g}</div>
                <div className="text-gray-300">Calorie</div>
              </div>
            </div>
          </Container>

          {/* Ingredients */}
          <Container css="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-900/50 rounded-lg w-fit p-2">
                <Info color="green" />
              </div>
              <h2 className="text-xl font-semibold text-white">Ingredienti</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">{food?.ingredients}</p>
          </Container>

          {/* Allergens */}
          <Container css="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-900/50 rounded-lg w-fit p-2">
                <AlertTriangle color="red" />
              </div>
              <h2 className="text-xl font-semibold text-white">Allergeni</h2>
            </div>
            <p className="text-gray-300">{formatAllergens(food?.allergens)}</p>
          </Container>

          {/* Additional Info */}
          <Container css="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-900/50 rounded-lg w-fit p-2">
                <Clock color="purple" />
              </div>
              <h2 className="text-xl font-semibold text-white">Informazioni Aggiuntive</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <strong>Codice prodotto:</strong> {food?.code}
              </div>
              <div>
                <strong>Categoria:</strong> {getMainCategory(food?.categories)}
              </div>
            </div>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default FoodDetailPage;
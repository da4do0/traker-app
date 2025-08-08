import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Info, Zap, Droplets, Wheat, Utensils } from "lucide-react";
import type { FoodDetailProps } from "../interfaces/Food";

const FoodDetail: React.FC<FoodDetailProps> = ({
  code,
  name,
  brands,
  quantity,
  categories,
  imageUrl,
  nutritionGrade,
  novaGroup,
  servingSize,
  nutrition,
  ingredients,
  allergens,
  onAdd,
  onDetail,
}) => {
  const navigate = useNavigate();

  const handleDetailClick = () => {
    navigate(`/food/${code}`, {
      state: {
        food: {
          code,
          name,
          brands,
          quantity,
          categories,
          imageUrl,
          nutritionGrade,
          novaGroup,
          servingSize,
          nutrition,
          ingredients,
          allergens,
        }
      }
    });
  };
  // Funzione per ottenere il colore del nutrition grade
  const getNutritionGradeColor = (grade: string) => {
    const gradeColors = {
      a: "bg-green-500/20 text-green-400 border border-green-500/30",
      b: "bg-lime-500/20 text-lime-400 border border-lime-500/30",
      c: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      d: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      e: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      gradeColors[grade?.toLowerCase() as keyof typeof gradeColors] ||
      "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    );
  };

  // Funzione per ottenere il colore del Nova Group
  const getNovaGroupColor = (group: number) => {
    const colors = {
      1: "bg-green-500/20 text-green-400 border border-green-500/30",
      2: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      3: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      4: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      colors[group as keyof typeof colors] ||
      "bg-gray-500/20 text-gray-400 border border-gray-500/30"
    );
  };

  // Funzione per ottenere la categoria principale
  const getMainCategory = (categories: string) => {
    const categoryList = categories?.split(",");
    return (
      categoryList[categoryList?.length - 1]?.replace("en:", "").trim() ||
      "Alimento"
    );
  };

  // Funzione per ottenere il colore della categoria (simile al tuo design)
  const getCategoryColor = (category: string) => {
    const lowerCategory = category?.toLowerCase();
    if (
      lowerCategory?.includes("sauce") ||
      lowerCategory?.includes("pasta") ||
      lowerCategory?.includes("sugo")
    ) {
      return "bg-red-500/20 text-red-400 border border-red-500/30";
    }
    return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  };

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-gray-600/50 transition-all cursor-pointer"
      onClick={handleDetailClick}
    >
      <div className="flex items-center gap-4">
        {/* Immagine prodotto */}
        <div className="flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzM3NDE1MSIvPgo8cGF0aCBkPSJNMjQgMjRIMjBWMjBIMjRWMjRaTTQ0IDI0SDQwVjIwSDQ0VjI0Wk0yMCA0MEgyNFY0NEgyMFY0MFpNNDAgNDBINDRWNDRINDBWNDBaIiBmaWxsPSIjNkI3Mjg1Ii8+Cjwvc3ZnPgo=";
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Nome e brand */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-semibold text-base truncate">
                {name}
              </h3>
              <p className="text-gray-400 text-sm">{brands}</p>
            </div>
            {onAdd && (
              <button
                onClick={onAdd}
                className="bg-green-600 hover:bg-green-700 transition-colors rounded-lg p-2 flex-shrink-0 ml-2"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            )}
          </div>

          {/* Valori nutrizionali */}
          <div className="flex items-center gap-4 text-sm mb-2">
            <span className="text-white font-medium">
              {nutrition?.calories100g} kcal/100g
            </span>
            <span className="text-blue-400">
              P: <span className="text-white">{nutrition?.protein100g}g</span>
            </span>
            <span className="text-orange-400">
              C: <span className="text-white">{nutrition?.carbs100g}g</span>
            </span>
            <span className="text-purple-400">
              G: <span className="text-white">{nutrition?.fat100g}g</span>
            </span>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-md ${getNutritionGradeColor(
                nutritionGrade
              )}`}
            >
              Nutri-Score: {nutritionGrade}
            </span>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-md ${getNovaGroupColor(
                novaGroup
              )}`}
            >
              Nova: {novaGroup}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;

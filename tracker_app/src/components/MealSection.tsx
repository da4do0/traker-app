import React from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, Utensils } from "lucide-react";
import Container from "./container";
import type { MealSectionProps } from "../types/FoodList";

const MealSection: React.FC<MealSectionProps> = ({
  section,
  onToggleExpanded,
  onEditFood,
  onDeleteFood,
  searchQuery,
}) => {
  // Filter foods based on search query
  const filteredFoods = section.foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description &&
        food.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasFilteredFoods = filteredFoods.length > 0;

  // Simplified color mapping for meal sections
  const borderColors = {
    yellow: "border-yellow-500/20",
    orange: "border-orange-500/20",
    purple: "border-purple-500/20",
    green: "border-green-500/20",
  } as const;

  const borderColor =
    borderColors[section.color as keyof typeof borderColors] ||
    borderColors.green;

  if (searchQuery && !hasFilteredFoods) {
    return null; // Don't render section if no foods match search
  }

  return (
    <Container>
      {/* Section Header */}
      <div
        className="flex items-center justify-between cursor-pointer min-h-[48px]"
        onClick={() => onToggleExpanded(section.id)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.emoji}</span>
          <div>
            <h3 className="text-white font-medium">{section.name}</h3>
            <p className="text-gray-400 text-sm">
              {filteredFoods.length} • {section.totalCalories} kcal
            </p>
          </div>
        </div>
        <div className="p-2">
          {section.expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Foods List */}
      {section.expanded && (
        <div className="mt-3 space-y-2">
          {hasFilteredFoods ? (
            filteredFoods.map((food) => (
              <div
                key={food?.id}
                className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800/70 transition-colors group min-h-[48px] flex items-center"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Food Image */}
                    {food?.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    )}

                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-medium truncate">
                          {food.name}
                        </h4>
                        <span className="text-orange-400 font-medium text-sm">
                          {food.calories} kcal
                        </span>
                        <span className="text-gray-400 text-sm">
                          {food.quantity}g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions - Always visible on mobile */}
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFood(food);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Modifica"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFood(food);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Elimina"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Utensils className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {searchQuery ? `Nessun alimento trovato` : `Nessun alimento`}
              </p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default MealSection;

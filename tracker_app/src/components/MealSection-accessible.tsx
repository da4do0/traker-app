import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Utensils } from 'lucide-react';
import Container from './container';
import type { MealSectionProps } from '../types/FoodList';

const MealSectionAccessible: React.FC<MealSectionProps> = ({
  section,
  onToggleExpanded,
  onEditFood,
  onDeleteFood,
  searchQuery
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Filter foods based on search query
  const filteredFoods = section.foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasFilteredFoods = filteredFoods.length > 0;

  // Enhanced color mapping with better contrast
  const colorClasses = {
    yellow: 'border-yellow-500/40 bg-gradient-to-r from-yellow-600/8 to-yellow-800/8',
    orange: 'border-orange-500/40 bg-gradient-to-r from-orange-600/8 to-orange-800/8',
    purple: 'border-purple-500/40 bg-gradient-to-r from-purple-600/8 to-purple-800/8',
    green: 'border-emerald-500/40 bg-gradient-to-r from-emerald-600/8 to-emerald-800/8'
  } as const;

  const colorClass = colorClasses[section.color as keyof typeof colorClasses] || colorClasses.green;

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  if (searchQuery && !hasFilteredFoods) {
    return null;
  }

  return (
    <Container css={`border ${colorClass}`}>
      {/* Enhanced Section Header with better accessibility */}
      <div
        ref={sectionRef}
        className="flex items-center justify-between cursor-pointer rounded-lg p-2 -m-2 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 focus-within:ring-offset-black"
        onClick={() => onToggleExpanded(section.id)}
        onKeyDown={(e) => handleKeyDown(e, () => onToggleExpanded(section.id))}
        tabIndex={0}
        role="button"
        aria-expanded={section.expanded}
        aria-controls={`meal-content-${section.id}`}
        aria-label={`${section.name}: ${filteredFoods.length} alimenti, ${section.totalCalories} calorie. ${section.expanded ? 'Premi per chiudere' : 'Premi per aprire'}`}
      >
        <div className="flex items-center gap-4">
          <span 
            className="text-2xl" 
            role="img" 
            aria-label={`${section.name} emoji`}
          >
            {section.emoji}
          </span>
          <div>
            <h3 className="text-white font-semibold text-lg leading-tight">
              {section.name}
            </h3>
            <p className="text-gray-300 text-sm" id={`meal-summary-${section.id}`}>
              {filteredFoods.length} aliment{filteredFoods.length !== 1 ? 'i' : 'o'} • {section.totalCalories} kcal
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 hidden sm:block">
            {section.expanded ? 'Comprimi' : 'Espandi'}
          </span>
          {section.expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-300" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-300" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Foods List with Enhanced Accessibility */}
      {section.expanded && (
        <div 
          id={`meal-content-${section.id}`}
          className="mt-6 space-y-3"
          role="region"
          aria-labelledby={`meal-summary-${section.id}`}
        >
          {hasFilteredFoods ? (
            <ul className="space-y-3" role="list">
              {filteredFoods.map((food, index) => (
                <li
                  key={food.id}
                  className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-200 group"
                  role="listitem"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Food Image with better alt text */}
                      {food.imageUrl && (
                        <img
                          src={food.imageUrl}
                          alt={`Immagine di ${food.name}`}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-700"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          loading="lazy"
                        />
                      )}
                      
                      {/* Food Info with better structure */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium text-base leading-tight mb-1">
                          {food.name}
                        </h4>
                        {food.description && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                            {food.description}
                          </p>
                        )}
                        
                        {/* Nutrition Summary - More readable */}
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span className="text-orange-300 font-medium">
                            {food.calories} kcal
                          </span>
                          <span className="text-gray-300">
                            {food.quantity}g
                          </span>
                        </div>
                        
                        {/* Macronutrients with better contrast */}
                        <div 
                          className="flex items-center gap-4 text-xs"
                          role="list"
                          aria-label="Valori nutrizionali"
                        >
                          <span className="text-blue-300" role="listitem">
                            P: {food.proteins.toFixed(1)}g
                          </span>
                          <span className="text-emerald-300" role="listitem">
                            C: {food.carbohydrates.toFixed(1)}g
                          </span>
                          <span className="text-amber-300" role="listitem">
                            G: {food.fats.toFixed(1)}g
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Action Buttons */}
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFood(food);
                        }}
                        className="p-2 text-gray-300 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                        aria-label={`Modifica ${food.name}`}
                        title="Modifica"
                      >
                        <Edit size={16} aria-hidden="true" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFood(food);
                        }}
                        className="p-2 text-gray-300 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
                        aria-label={`Elimina ${food.name}`}
                        title="Elimina"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12" role="status" aria-live="polite">
              <Utensils className="w-12 h-12 text-gray-500 mx-auto mb-4" aria-hidden="true" />
              <p className="text-gray-400 text-sm">
                {searchQuery 
                  ? `Nessun alimento trovato per "${searchQuery}"`
                  : `Nessun alimento aggiunto per ${section.name.toLowerCase()}`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
};

export default MealSectionAccessible;
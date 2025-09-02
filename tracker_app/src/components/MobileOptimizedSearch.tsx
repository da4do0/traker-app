import React, { useState } from 'react';
import { Search, Plus, X, Filter } from 'lucide-react';
import Container from './container';

interface MobileOptimizedSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddFood: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  mealTypes: Array<{ id: string; name: string; emoji: string; color: string }>;
}

const MobileOptimizedSearch: React.FC<MobileOptimizedSearchProps> = ({
  searchQuery,
  onSearchChange,
  onAddFood,
  showFilters,
  onToggleFilters,
  mealTypes
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Search Bar - Mobile Optimized */}
      <Container>
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search 
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                isSearchFocused ? 'text-emerald-400' : 'text-gray-400'
              }`} 
              size={18} 
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Cerca alimenti..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 
                         focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
                         text-base" // Prevent zoom on iOS
              aria-label="Cerca alimenti"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white 
                           focus:outline-none focus:text-white rounded"
                aria-label="Cancella ricerca"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Action Row */}
        <div className="flex gap-3 mt-4">
          {/* Add Food Button - Prominent */}
          <button
            onClick={onAddFood}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-6 py-4 rounded-xl 
                       font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
                       touch-manipulation" // Optimizes for touch
            style={{ minHeight: '52px' }} // Minimum touch target size
          >
            <Plus size={20} aria-hidden="true" />
            <span className="text-base">Aggiungi Alimento</span>
          </button>
          
          {/* Filter Toggle - Secondary */}
          <button
            onClick={onToggleFilters}
            className={`px-4 py-4 rounded-xl border transition-all duration-200 flex items-center justify-center
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
                       touch-manipulation ${
              showFilters
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
            }`}
            style={{ minHeight: '52px' }}
            aria-label={showFilters ? 'Nascondi filtri' : 'Mostra filtri'}
            aria-expanded={showFilters}
          >
            <Filter size={20} aria-hidden="true" />
          </button>
        </div>
      </Container>

      {/* Mobile-Optimized Filters Panel */}
      {showFilters && (
        <Container>
          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg">Filtra per pasto</h3>
            
            {/* Mobile Filter Grid */}
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((meal) => (
                <button
                  key={meal.id}
                  className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 
                             border border-gray-600 rounded-xl transition-all duration-200 text-left
                             focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black
                             touch-manipulation"
                  style={{ minHeight: '60px' }} // Larger touch targets
                >
                  <span className="text-xl" role="img" aria-hidden="true">
                    {meal.emoji}
                  </span>
                  <span className="text-white font-medium text-sm">
                    {meal.name}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Clear All Filters */}
            <button
              onClick={() => {
                // Clear all filters logic here
                onToggleFilters();
              }}
              className="w-full p-3 text-gray-400 hover:text-white text-sm transition-colors duration-200
                         focus:outline-none focus:text-white rounded-lg"
            >
              Rimuovi tutti i filtri
            </button>
          </div>
        </Container>
      )}

      {/* Search Results Summary - Mobile */}
      {searchQuery && (
        <Container>
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-300 text-sm">
              Risultati per "{searchQuery}"
            </span>
            <button
              onClick={() => onSearchChange('')}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium
                         focus:outline-none focus:underline"
            >
              Cancella
            </button>
          </div>
        </Container>
      )}
    </div>
  );
};

export default MobileOptimizedSearch;
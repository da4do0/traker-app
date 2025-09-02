import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Container from './container';
import type { QuickStatsProps } from '../types/FoodList';

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const progressBarColor = stats.progressPercentage > 100 ? 'bg-red-500' : 'bg-green-500';
  const progressWidth = Math.min(stats.progressPercentage, 100);

  return (
    <div className="mb-6">
      <Container>
      {/* Main Stats - Always Visible */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-orange-400" />
          <div>
            <div className="text-white font-semibold text-lg">
              {stats.totalCalories} <span className="text-sm font-normal text-gray-400">/ {stats.calorieGoal} kcal</span>
            </div>
            <div className="text-sm text-gray-400">
              {stats.progressPercentage.toFixed(0)}% completato
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors p-1"
        >
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
      
      {/* Remaining Calories */}
      <div className="text-center">
        <span className={`text-sm font-medium ${stats.remainingCalories >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stats.remainingCalories >= 0 
            ? `${stats.remainingCalories} kcal rimanenti`
            : `${Math.abs(stats.remainingCalories)} kcal in eccesso`
          }
        </span>
      </div>

      {/* Expandable Macronutrients */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-700/30">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-white font-medium text-lg">
                {stats.totalProteins.toFixed(1)}g
              </div>
              <div className="text-blue-300 text-xs">Proteine</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium text-lg">
                {stats.totalCarbohydrates.toFixed(1)}g
              </div>
              <div className="text-green-300 text-xs">Carboidrati</div>
            </div>
            <div className="text-center">
              <div className="text-white font-medium text-lg">
                {stats.totalFats.toFixed(1)}g
              </div>
              <div className="text-purple-300 text-xs">Grassi</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalCalories === 0 && (
        <div className="mt-3 text-center">
          <p className="text-gray-400 text-sm">
            Aggiungi i tuoi primi alimenti per iniziare!
          </p>
        </div>
      )}
      </Container>
    </div>
  );
};

export default QuickStats;
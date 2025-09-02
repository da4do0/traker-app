import React, { useState } from 'react';
import { Zap, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import Container from './container';
import type { QuickStatsProps } from '../types/FoodList';

const QuickStatsMinimal: React.FC<QuickStatsProps> = ({ stats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const progressBarColor = stats.progressPercentage > 100 ? 'bg-red-500' : 'bg-emerald-500';
  const progressWidth = Math.min(stats.progressPercentage, 100);

  return (
    <Container>
      {/* Primary Focus: Calorie Progress - Simplified */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/30 rounded-xl">
              <Zap className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {stats.totalCalories} <span className="text-base font-normal text-gray-400">/ {stats.calorieGoal}</span>
              </h2>
              <p className="text-sm text-gray-400">calorie oggi</p>
            </div>
          </div>
          
          {/* Simplified Progress Indicator */}
          <div className="text-right">
            <div className={`text-lg font-semibold ${stats.remainingCalories >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.remainingCalories >= 0 ? stats.remainingCalories : Math.abs(stats.remainingCalories)}
            </div>
            <p className="text-xs text-gray-400">
              {stats.remainingCalories >= 0 ? 'rimanenti' : 'in eccesso'}
            </p>
          </div>
        </div>
        
        {/* Minimalist Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
          <div 
            className={`h-1.5 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${progressWidth}%` }}
            role="progressbar"
            aria-valuenow={stats.totalCalories}
            aria-valuemin={0}
            aria-valuemax={stats.calorieGoal}
            aria-label={`Progresso calorico giornaliero: ${stats.totalCalories} di ${stats.calorieGoal} calorie`}
          />
        </div>
      </div>

      {/* Progressive Disclosure for Macros */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-expanded={showDetails}
        aria-controls="macro-details"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm text-gray-300">Dettagli macronutrienti</span>
        </div>
        {showDetails ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Collapsed Macronutrient Details */}
      {showDetails && (
        <div id="macro-details" className="mt-4 space-y-3" role="region" aria-label="Dettagli macronutrienti">
          {/* Clean, Minimal Macro Cards */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-3 bg-blue-900/10 border border-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" aria-hidden="true"></div>
                <span className="text-sm text-blue-300">Proteine</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.totalProteins.toFixed(1)}g</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-emerald-900/10 border border-emerald-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" aria-hidden="true"></div>
                <span className="text-sm text-emerald-300">Carboidrati</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.totalCarbohydrates.toFixed(1)}g</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-900/10 border border-amber-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" aria-hidden="true"></div>
                <span className="text-sm text-amber-300">Grassi</span>
              </div>
              <span className="text-sm font-medium text-white">{stats.totalFats.toFixed(1)}g</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Simplified */}
      {stats.totalCalories === 0 && (
        <div className="mt-6 p-4 border border-dashed border-gray-700 rounded-xl text-center">
          <p className="text-gray-400 text-sm">
            Aggiungi il tuo primo alimento per iniziare
          </p>
        </div>
      )}
    </Container>
  );
};

export default QuickStatsMinimal;
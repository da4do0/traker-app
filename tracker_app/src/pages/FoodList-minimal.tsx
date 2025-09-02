import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  RefreshCw,
  Calendar,
  TrendingUp
} from "lucide-react";
import Header from "../components/Header";
import Container from "../components/container";
import QuickStatsMinimal from "../components/QuickStats-minimal";
import MealSectionAccessible from "../components/MealSection-accessible";
import MobileOptimizedSearch from "../components/MobileOptimizedSearch";
import EditFoodModal from "../components/EditFoodModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ErrorDisplay from "../components/ErrorDisplay";
import { APIDbHandler } from "../api/APIHandler";
import { useUser } from "../hooks/UserInfo";
import type { 
  FoodEntry, 
  MealSection as MealSectionType, 
  DailyStats, 
  EditFoodData, 
  MealType 
} from "../types/FoodList";

// Simplified meal types - reduced visual complexity
const MEAL_TYPES: MealType[] = [
  { id: "Colazione", name: "Colazione", emoji: "☀️", color: "yellow" },
  { id: "Pranzo", name: "Pranzo", emoji: "🍽️", color: "orange" },
  { id: "Cena", name: "Cena", emoji: "🌙", color: "purple" },
  { id: "Spuntino", name: "Spuntini", emoji: "🥨", color: "green" }
] as const;

const FoodListMinimal: React.FC = () => {
  const navigate = useNavigate();
  
  // State management - simplified
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [mealSections, setMealSections] = useState<MealSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProteins: 0,
    totalCarbohydrates: 0,
    totalFats: 0,
    calorieGoal: 2000,
    remainingCalories: 2000,
    progressPercentage: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodEntry | null>(null);

  // Core functions (same logic, cleaner implementation)
  const calculateDailyStats = (foods: FoodEntry[], calorieGoal: number = 2000) => {
    const stats = foods.reduce(
      (acc, food) => {
        acc.totalCalories += food.calories;
        acc.totalProteins += food.proteins;
        acc.totalCarbohydrates += food.carbohydrates;
        acc.totalFats += food.fats;
        return acc;
      },
      {
        totalCalories: 0,
        totalProteins: 0,
        totalCarbohydrates: 0,
        totalFats: 0,
      }
    );

    const remainingCalories = calorieGoal - stats.totalCalories;
    const progressPercentage = (stats.totalCalories / calorieGoal) * 100;

    setDailyStats({
      ...stats,
      calorieGoal,
      remainingCalories,
      progressPercentage: Math.round(progressPercentage * 10) / 10
    });
  };

  const organizeMealSections = (foods: FoodEntry[]) => {
    const sections: MealSectionType[] = MEAL_TYPES.map(mealType => {
      const mealFoods = foods.filter(food => food.meal === mealType.id);
      const totalCalories = mealFoods.reduce((sum, food) => sum + food.calories, 0);

      return {
        id: mealType.id,
        name: mealType.name,
        emoji: mealType.emoji,
        color: mealType.color,
        foods: mealFoods,
        totalCalories,
        expanded: mealFoods.length > 0
      };
    });

    setMealSections(sections);
  };

  const handleEditFood = async (data: EditFoodData) => {
    try {
      setIsUpdating(true);
      
      const updatedFoods = foodEntries.map(food => {
        if (food.id === data.id) {
          const ratio = data.quantity / 100;
          return {
            ...food,
            quantity: data.quantity,
            meal: data.meal,
            calories: Math.round((food.calories / (food.quantity / 100)) * ratio),
            proteins: Math.round(((food.proteins / (food.quantity / 100)) * ratio) * 10) / 10,
            carbohydrates: Math.round(((food.carbohydrates / (food.quantity / 100)) * ratio) * 10) / 10,
            fats: Math.round(((food.fats / (food.quantity / 100)) * ratio) * 10) / 10,
          };
        }
        return food;
      });

      setFoodEntries(updatedFoods);
      calculateDailyStats(updatedFoods);
      organizeMealSections(updatedFoods);
      setEditingFood(null);
      
    } catch (error) {
      console.error("Error updating food:", error);
      setError("Errore nell'aggiornamento dell'alimento");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFood = async (foodId: number) => {
    try {
      setIsDeleting(true);
      
      const updatedFoods = foodEntries.filter(food => food.id !== foodId);
      
      setFoodEntries(updatedFoods);
      calculateDailyStats(updatedFoods);
      organizeMealSections(updatedFoods);
      setDeletingFood(null);
      
    } catch (error) {
      console.error("Error deleting food:", error);
      setError("Errore nell'eliminazione dell'alimento");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleMealSection = (mealId: string) => {
    setMealSections(sections =>
      sections.map(section =>
        section.id === mealId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  // Mock data initialization (same as original)
  useEffect(() => {
    const mockData: FoodEntry[] = [
      // Colazione
      {
        id: 1,
        name: "Avena con Latte",
        calories: 320,
        proteins: 12.5,
        carbohydrates: 45.2,
        fats: 8.1,
        quantity: 150,
        meal: "Colazione",
        description: "Fiocchi d'avena con latte parzialmente scremato",
        imageUrl: "https://images.unsplash.com/photo-1574859443881-0e5d8ac0fe0c?w=100&h=100&fit=crop"
      },
      {
        id: 2,
        name: "Caffè con Zucchero",
        calories: 45,
        proteins: 0.2,
        carbohydrates: 11.0,
        fats: 0.1,
        quantity: 200,
        meal: "Colazione",
        description: "Caffè espresso con zucchero",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop"
      },
      // Additional mock data...
      {
        id: 3,
        name: "Pasta al Pomodoro",
        calories: 380,
        proteins: 12.8,
        carbohydrates: 65.4,
        fats: 6.2,
        quantity: 120,
        meal: "Pranzo",
        description: "Spaghetti con salsa di pomodoro fresco e basilico",
        imageUrl: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=100&h=100&fit=crop"
      },
      {
        id: 4,
        name: "Salmone al Forno",
        calories: 185,
        proteins: 25.4,
        carbohydrates: 0.0,
        fats: 8.1,
        quantity: 120,
        meal: "Cena",
        description: "Filetto di salmone al forno con limone",
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=100&h=100&fit=crop"
      }
    ];
    
    setFoodEntries(mockData);
    calculateDailyStats(mockData);
    organizeMealSections(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <main className="container mx-auto px-6 py-8 max-w-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Simplified Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">
              Diario Alimentare
            </h1>
            <p className="text-gray-400 text-sm">
              {new Date(selectedDate).toLocaleDateString('it-IT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm 
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              aria-label="Seleziona data"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
        )}

        {/* Minimal Quick Stats */}
        <QuickStatsMinimal stats={dailyStats} />

        {/* Mobile-Optimized Search */}
        <MobileOptimizedSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddFood={() => navigate("/food")}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          mealTypes={MEAL_TYPES}
        />

        {/* Simplified Meal Sections */}
        <div className="space-y-4">
          {mealSections
            .filter(section => section.foods.length > 0 || !searchQuery) // Show empty sections only when not searching
            .map((section) => (
              <MealSectionAccessible
                key={section.id}
                section={section}
                onToggleExpanded={handleToggleMealSection}
                onEditFood={setEditingFood}
                onDeleteFood={setDeletingFood}
                searchQuery={searchQuery}
              />
          ))}
        </div>

        {/* Improved Empty State */}
        {foodEntries.length === 0 && !loading && (
          <Container>
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Inizia il tuo diario
              </h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                Aggiungi il tuo primo alimento per iniziare a tracciare la tua alimentazione quotidiana
              </p>
              <button
                onClick={() => navigate("/food")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium 
                           transition-all duration-200 flex items-center gap-3 mx-auto shadow-lg
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              >
                <Plus size={20} />
                Aggiungi Primo Alimento
              </button>
            </div>
          </Container>
        )}

        {/* Progress Summary - Only show if has data */}
        {foodEntries.length > 0 && (
          <Container>
            <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-emerald-600/10 to-emerald-800/10 rounded-xl border border-emerald-600/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 text-sm">
                {mealSections.filter(s => s.foods.length > 0).length} pasti registrati oggi
              </span>
            </div>
          </Container>
        )}
      </main>

      {/* Modals - No changes needed */}
      <EditFoodModal
        isOpen={!!editingFood}
        onClose={() => setEditingFood(null)}
        food={editingFood}
        onSave={handleEditFood}
        isLoading={isUpdating}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        food={deletingFood}
        onConfirm={handleDeleteFood}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FoodListMinimal;
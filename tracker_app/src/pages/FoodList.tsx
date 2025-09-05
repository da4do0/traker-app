import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Filter, 
  Search,
  RefreshCw,
  Calendar,
  UserCircle,
  BarChart2,
  Home
} from "lucide-react";
import Header from "../components/Header";
import Container from "../components/container";
import QuickStats from "../components/QuickStats";
import MealSection from "../components/MealSection";
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
import type {Food} from "../types/Food";

// Backend API response type
interface BackendFoodItem {
  id: number; // UserFood ID (primary key of UserFoods table)
  foodId: number; // Food ID (reference to Foods table)
  name: string;
  description: string;
  image: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  code: string;
  quantity: number;
  meal: number; // 1=Colazione, 2=Pranzo, 3=Cena, 4=Spuntino
  date: string; // ISO date string
}

const MEAL_TYPES: MealType[] = [
  { id: "Colazione", name: "Colazione", emoji: "🌅", color: "yellow" },
  { id: "Pranzo", name: "Pranzo", emoji: "☀️", color: "orange" },
  { id: "Cena", name: "Cena", emoji: "🌙", color: "purple" },
  { id: "Spuntino", name: "Spuntini", emoji: "🍎", color: "green" }
] as const;

// Helper function to convert meal number to meal name
const getMealName = (mealNumber: number): string => {
  
  let result: string;
  switch (mealNumber) {
    case 0: result = "Colazione"; break;  // Breakfast
    case 1: result = "Pranzo"; break;     // Lunch
    case 2: result = "Cena"; break;       // Dinner
    case 3: result = "Spuntino"; break;   // Snack
    default: result = "Spuntino"; break;
  }
  
  return result;
};

// Helper function to convert meal name to meal number (for API calls)
const getMealNumber = (mealName: string): number => {
  
  let result: number;
  switch (mealName) {
    case "Colazione": result = 0; break;  // Breakfast
    case "Pranzo": result = 1; break;     // Lunch
    case "Cena": result = 2; break;       // Dinner
    case "Spuntino": result = 3; break;   // Snack
    default: result = 3; break; // Default to Snack
  }

  return result;
};

const FoodList: React.FC = () => {
  const navigate = useNavigate();
  const { userId, username } = useUser();
  
  // State management
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

  // Load user's food entries for today
  const loadFoodEntries = async () => {
    try {
      setLoading(true);
      setError(null);


      if (userId) {
        const response: BackendFoodItem[] = await APIDbHandler.FoodList(userId);
        
        // Transform API data to our FoodEntry format
        const entries: FoodEntry[] = response
          .filter((item: BackendFoodItem) => {
            // Filter by selected date
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate === selectedDate;
          })
          .map((item: BackendFoodItem, index: number) => ({
            id: item.id, // UserFood ID from backend
            foodId: item.foodId, // Food ID from backend
            name: item.name,
            calories: Math.round((item.calories / 100) * item.quantity),
            proteins: Math.round(((item.proteins / 100) * item.quantity) * 10) / 10,
            carbohydrates: Math.round(((item.carbohydrates / 100) * item.quantity) * 10) / 10,
            fats: Math.round(((item.fats / 100) * item.quantity) * 10) / 10,
            quantity: item.quantity,
            meal: getMealName(item.meal), // Convert meal number to meal name
            description: item.description,
            imageUrl: item.image
          }));
  
        setFoodEntries(entries);
        calculateDailyStats(entries);
        organizeMealSections(entries);
      }
      
      
    } catch (error) {
      console.error("Error loading food entries:", error);
      setError("Errore nel caricamento dei dati. Riprova più tardi.");
      setFoodEntries([]);
      calculateDailyStats([]);
      organizeMealSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily statistics
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

  // Organize foods into meal sections
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
        expanded: mealFoods.length > 0 // Auto-expand sections with foods
      };
    });

    setMealSections(sections);
  };

  const mapMealToEnum = (italianMeal: string): number => {
    console.log(`🔄 [APIHandler] mapMealToEnum called with: ${italianMeal}`);
    
    const mealMap: { [key: string]: number } = {
      "Colazione": 0,  // Breakfast
      "Pranzo": 1,     // Lunch  
      "Cena": 2,       // Dinner
      "Spuntino": 3    // Snack
    };
    
    const result = mealMap[italianMeal] || 3; // Default to Snack if not found
    console.log(`🔄 [APIHandler] mapMealToEnum returning: ${result} for ${italianMeal}`);
    return result;
  }

  // Handle food editing
  const handleEditFood = async (data: EditFoodData) => {
    try {
      console.log(`🍽️ [FoodList] handleEditFood called with data:`, data);
      console.log(`🍽️ [FoodList] data.meal value: '${data.meal}' (type: ${typeof data.meal})`);
      
      setIsUpdating(true);

      // Get the original food entry to preserve existing data
      const originalFood = foodEntries.find(f => f.id === data.id);
      if (!originalFood) {
        throw new Error("Food entry not found");
      }

      // Create payload for APIHandler - it will handle the meal conversion
      const updatePayload = {
        Id: data.id as number,
        FoodId: originalFood.foodId as number, // Use the correct Food ID from backend
        UserId: userId as number,
        Quantity: data.quantity,
        Date: new Date(),
        Meal: mapMealToEnum(data.meal) // Send Italian meal name - APIHandler will convert it
      };

      console.log(`🍽️ [FoodList] Sending updatePayload to APIHandler:`, updatePayload);

      // Call update API - APIHandler will format it correctly for the backend
      const response = await APIDbHandler.UpdateFood(updatePayload);
      console.log("🍽️ [FoodList] UpdateFood API response:", response);

      // Update local state
      const updatedFoods = foodEntries.map(food => {
        if (food.id === data.id) {
          console.log(`🍽️ [FoodList] Updating food with ID: ${data.id}`);
          console.log(`🍽️ [FoodList] Original food meal: '${food.meal}' -> New meal: '${data.meal}'`);
          
          // Recalculate nutrition values based on new quantity
          const ratio = data.quantity / 100;
          const updatedFood = {
            ...food,
            quantity: data.quantity,
            meal: data.meal,
            calories: Math.round((food.calories / (food.quantity / 100)) * ratio),
            proteins: Math.round(((food.proteins / (food.quantity / 100)) * ratio) * 10) / 10,
            carbohydrates: Math.round(((food.carbohydrates / (food.quantity / 100)) * ratio) * 10) / 10,
            fats: Math.round(((food.fats / (food.quantity / 100)) * ratio) * 10) / 10,
          };
          
          console.log(`🍽️ [FoodList] Updated food:`, updatedFood);
          return updatedFood;
        }
        return food;
      });

      console.log(`🍽️ [FoodList] All updated foods:`, updatedFoods);

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

  // Handle food deletion
  const handleDeleteFood = async (foodId: string | number) => {
    try {
      setIsDeleting(true);
      
      // Use the foodId directly as it's now the correct UserFood ID
      const userFoodId = typeof foodId === 'string' ? parseInt(foodId) : foodId;
      
      const response = await APIDbHandler.DeleteFood(userFoodId);
      
      // Update local state
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

  // Handle meal section expand/collapse
  const handleToggleMealSection = (mealId: string) => {
    setMealSections(sections =>
      sections.map(section =>
        section.id === mealId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  useEffect(() => {
    loadFoodEntries();
  }, [selectedDate, userId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white p-2 md:p-6 pb-20 md:pb-6">
        <Header />
        <main className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white p-2 md:p-6 pb-20 md:pb-6">
      <Header />
      <main className="max-w-4xl mx-auto mb-6">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Il Mio Diario</h1>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); loadFoodEntries(); }}
              className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
        )}

        {/* Quick Stats */}
        <QuickStats stats={dailyStats} />

        {/* Search and Quick Actions */}
        <div className="mb-6">
          {searchQuery ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cerca alimenti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setSearchQuery(" ")}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border text-gray-300 hover:text-white transition-colors"
                style={{
                  backgroundColor: '#6B728066' + '1A',
                  borderColor: '#6B728066' + '66'
                }}
              >
                <Search size={16} />
                <span className="text-sm">Cerca</span>
              </button>
              {MEAL_TYPES.slice(0, 3).map((meal) => (
                <button
                  key={meal.id}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border text-gray-300 hover:text-white transition-colors"
                  style={{
                    backgroundColor: '#6B728066' + '1A',
                    borderColor: '#6B728066' + '66'
                  }}
                >
                  <span>{meal.emoji}</span>
                  <span className="text-sm hidden sm:inline">{meal.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meal Sections */}
        <div className="space-y-4">
          {mealSections.map((section) => (
            <MealSection
              key={section.id}
              section={section}
              onToggleExpanded={handleToggleMealSection}
              onEditFood={setEditingFood}
              onDeleteFood={setDeletingFood}
              searchQuery={searchQuery}
            />
          ))}
        </div>

        {/* Empty State */}
        {foodEntries.length === 0 && !loading && (
          <Container>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Nessun alimento registrato</h3>
              <p className="text-gray-400 mb-6">
                Inizia ad aggiungere i tuoi pasti per tracciare la tua alimentazione
              </p>
              <button
                onClick={() => navigate("/food")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto min-h-[48px]"
              >
                <Plus size={18} />
                Aggiungi Primo Alimento
              </button>
            </div>
          </Container>
        )}
      </main>

      {/* Floating Action Button */}
      {foodEntries.length > 0 && (
        <button
          onClick={() => navigate("/food")}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 z-50 min-h-[56px] min-w-[56px] flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Footer mobile */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex justify-around items-center py-2 md:hidden z-20">
        <button 
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-gray-400 hover:text-emerald-400 transition-colors"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-emerald-400">
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Diario</span>
        </button>
        <button 
          onClick={() => navigate("/food")}
          className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-lg -mt-8 border-4 border-gray-950"
        >
          <Plus className="w-7 h-7" />
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs">Statistiche</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <UserCircle className="w-6 h-6" />
          <span className="text-xs">Profilo</span>
        </button>
      </footer>

      {/* Modals */}
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
        onConfirm={(foodId) => handleDeleteFood(foodId)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FoodList;
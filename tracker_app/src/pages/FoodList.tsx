import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import Shell, { PageHead } from "../components/Shell";
import MealSection from "../components/MealSection";
import EditFoodModal from "../components/EditFoodModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Btn, DotBar, ErrorBanner, Glyph, RDot, fmt, splitSegments, useIsDesktop } from "../components/ui";
import { APIDbHandler } from "../api/APIHandler";
import { useUser } from "../hooks/UserInfo";
import type { 
  FoodEntry, 
  MealSection as MealSectionType, 
  DailyStats, 
  EditFoodData, 
  MealType
} from "../types/FoodList";

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
  { id: "Spuntino", name: "Spuntino", emoji: "🍎", color: "green" }
] as const;

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


const FoodList: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  // State management
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [mealSections, setMealSections] = useState<MealSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    totalCalories: 0,
    totalProteins: 0,
    totalCarbohydrates: 0,
    totalFats: 0,
    calorieGoal: 2000,
    remainingCalories: 2000,
    progressPercentage: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [goal, setGoal] = useState(2000);
  const desktop = useIsDesktop();

  // Modal states
  const [editingFood, setEditingFood] = useState<FoodEntry | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodEntry | null>(null);

  // Load user's food entries for today
  const loadFoodEntries = async () => {
    try {
      setLoading(true);
      setError(null);


      if (userId) {
        // quota giornaliera reale dell'utente (InfoUser), 2000 solo se non disponibile
        const [response, info]: [BackendFoodItem[], any] = await Promise.all([
          APIDbHandler.FoodList(userId),
          APIDbHandler.InfoUser(userId).catch(() => null),
        ]);
        const calorieGoal = info?.userInfo?.dailyCalorieGoal || 2000;
        setGoal(calorieGoal);

        // Transform API data to our FoodEntry format
        const entries: FoodEntry[] = response
          .filter((item: BackendFoodItem) => {
            // Filter by selected date
            const itemDate = new Date(item.date).toISOString().split('T')[0];
            return itemDate === selectedDate;
          })
          .map((item: BackendFoodItem) => ({
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
        calculateDailyStats(entries, calorieGoal);
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
  const calculateDailyStats = (foods: FoodEntry[], calorieGoal: number = goal) => {
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
    
    const mealMap: { [key: string]: number } = {
      "Colazione": 0,  // Breakfast
      "Pranzo": 1,     // Lunch  
      "Cena": 2,       // Dinner
      "Spuntino": 3    // Snack
    };
    
    const result = mealMap[italianMeal] || 3; // Default to Snack if not found
    return result;
  }

  // Handle food editing
  const handleEditFood = async (data: EditFoodData) => {
    try {
      
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


      // Call update API - APIHandler will format it correctly for the backend
      await APIDbHandler.UpdateFood(updatePayload);

      // Update local state
      const updatedFoods = foodEntries.map(food => {
        if (food.id === data.id) {
          
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
          
          return updatedFood;
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

  // Handle food deletion
  const handleDeleteFood = async (foodId: string | number) => {
    try {
      setIsDeleting(true);
      
      // Use the foodId directly as it's now the correct UserFood ID
      const userFoodId = typeof foodId === 'string' ? parseInt(foodId) : foodId;
      
      await APIDbHandler.DeleteFood(userFoodId);
      
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


  // ---------- UI
  if (loading) {
    return (
      <Shell active="diario">
        <PageHead title="diario" />
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      </Shell>
    );
  }

  const hasFood = foodEntries.length > 0;
  // pasti con alimenti nell'ordine standard, quelli vuoti in fondo
  const ordered = [...mealSections].sort((a, b) => Number(b.foods.length > 0) - Number(a.foods.length > 0));
  const N = desktop ? 30 : 34;
  const segs = splitSegments(ordered.filter((s) => s.foods.length).map((s) => s.totalCalories), dailyStats.calorieGoal, N);
  const { totalCalories, totalProteins: p, totalCarbohydrates: c, totalFats: f, remainingCalories: left } = dailyStats;
  const energy = c * 4 + p * 4 + f * 9;
  const macros: [string, number, number][] = [["CARBO", c, c * 4], ["PROT", p, p * 4], ["GRASSI", f, f * 9]];

  const total = (
    <section className={`rounded-[28px] bg-tile p-5 ${hasFood ? "pb-7 lg:pb-[50px]" : "pb-9 lg:pb-[70px]"} lg:rounded-[32px] lg:p-7 lg:pt-[26px]`}>
      <span className="t-label text-ink2">TOTALE DEL GIORNO</span>
      <div className="mt-[14px] flex items-end gap-x-[10px] lg:mt-[18px] lg:flex-col lg:items-start">
        <RDot text={fmt(totalCalories)} p={[7, 8]} />
        <span className="t-label text-ink2 lg:mt-3">/ {fmt(dailyStats.calorieGoal)} KCAL</span>
      </div>
      <Glyph className="mt-[18px]" total={N} h={desktop ? 20 : 18} gap={3} groupGap={8} groups={segs.map((n) => ({ n }))} />
      {desktop ? (
        <>
          <div className="mt-[18px] grid grid-cols-2">
            <div>
              <span className="t-label-s block text-ink2">{left < 0 ? "OLTRE" : "RESTANO"}</span>
              <span className={`t-data-l mt-1 block ${left < 0 ? "text-signal" : ""}`}>{fmt(Math.abs(left))} KCAL</span>
            </div>
            {hasFood && (
              <div>
                <span className="t-label-s block text-ink2">USATA</span>
                <span className="t-data-l mt-1 block">{fmt(Math.round(dailyStats.progressPercentage))}%</span>
              </div>
            )}
          </div>
          {hasFood && (
            <>
              <div className="mt-5 h-px bg-line" />
              <div className="mt-[19px] flex flex-col gap-[26px]">
                {macros.map(([k, g, kcal]) => (
                  <div key={k} className="flex h-4 items-center">
                    <span className="t-label w-[72px] text-ink2">{k}</span>
                    <DotBar n={14} on={energy ? Math.round((kcal / energy) * 14) : 0} size={7} gap={4} />
                    <span className="t-data ml-auto">{fmt(Math.round(g))} G</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : hasFood && (
        <div className="mt-5 flex justify-between">
          <span className={`t-data ${left < 0 ? "text-signal" : ""}`}>{left < 0 ? "OLTRE" : "RESTANO"} {fmt(Math.abs(left))}</span>
          <span className="t-label text-ink2">C {fmt(Math.round(c))} · P {fmt(Math.round(p))} · G {fmt(Math.round(f))}</span>
        </div>
      )}
    </section>
  );

  const filter = (
    <label className="flex h-12 cursor-text items-center gap-[10px] rounded-full bg-control px-[18px] lg:w-[340px] lg:gap-3">
      <Search size={18} strokeWidth={1.5} className="shrink-0 text-ink2" />
      <input
        type="text"
        placeholder="Filtra gli alimenti di oggi"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="t-body min-w-0 flex-1 bg-transparent text-ink caret-ink outline-none"
      />
    </label>
  );

  // anello di punti concentrici (illustrazione dello stato vuoto)
  const rings: [number, number, number][] = desktop ? [[40, 96, 3.5], [28, 62, 3]] : [[36, 78, 3], [24, 50, 2.5]];
  const C = rings[0][1] + rings[0][2];
  const empty = (
    <section className="flex flex-col items-center px-5 text-center lg:h-[560px] lg:rounded-[32px] lg:bg-tile">
      <svg width={2 * C} height={2 * C} className="mt-[47px] lg:mt-[84px]" aria-hidden>
        {rings.flatMap(([n, r, s]) => Array.from({ length: n }, (_, i) => (
          <circle key={`${r}-${i}`} cx={C + r * Math.cos((2 * Math.PI * i) / n)} cy={C + r * Math.sin((2 * Math.PI * i) / n)} r={s} className="fill-dotoff" />
        )))}
        <circle cx={C} cy={C} r={desktop ? 5 : 4} className="fill-ink" />
      </svg>
      <h2 className="t-title mt-[29px] lg:t-title-l lg:mt-10">Ancora niente oggi</h2>
      <p className="t-body mt-2 max-w-[310px] text-ink2 lg:mt-[10px] lg:max-w-[443px]">
        Cerca un alimento o scansiona un codice a barre: lo trovi qui, diviso per pasto{desktop ? ", con calorie e macro" : ""}.
      </p>
      <Btn icon={<Plus size={20} strokeWidth={2} />} onClick={() => navigate("/food")} className="mt-[22px] w-[270px] lg:mt-7 lg:w-[300px]">
        Aggiungi il primo alimento
      </Btn>
    </section>
  );

  const meals = ordered.map((section) => (
    <MealSection
      key={section.id}
      section={section}
      onToggleExpanded={handleToggleMealSection}
      onEditFood={setEditingFood}
      onDeleteFood={setDeletingFood}
      searchQuery={searchQuery}
    />
  ));

  return (
    <Shell active="diario">
      <PageHead title="diario" right={desktop && hasFood && filter} />

      {error && <div className="mb-3"><ErrorBanner onDismiss={() => setError(null)}>{error}</ErrorBanner></div>}

      {desktop ? (
        <div className="grid grid-cols-12 items-start gap-6">
          <div className="sticky top-8 col-span-4">{total}</div>
          <div className="col-span-8 flex flex-col gap-3">{hasFood ? meals : empty}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {total}
          {hasFood ? <>{filter}{meals}</> : empty}
        </div>
      )}

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
    </Shell>
  );
};

export default FoodList;
export interface FoodEntry {
  id: string | number;
  foodId?: number; // Food ID from the Foods table
  name: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  quantity: number;
  meal: string;
  description?: string;
  imageUrl?: string;
}

export interface MealSection {
  id: string;
  name: string;
  emoji: string;
  color: string;
  foods: FoodEntry[];
  totalCalories: number;
  expanded: boolean;
}

export interface DailyStats {
  totalCalories: number;
  totalProteins: number;
  totalCarbohydrates: number;
  totalFats: number;
  calorieGoal: number;
  remainingCalories: number;
  progressPercentage: number;
}

export interface EditFoodData {
  id: string | number;
  quantity: number;
  meal: string;
}

export interface MealType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface QuickStatsProps {
  stats: DailyStats;
}

export interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodEntry | null;
  onSave: (data: EditFoodData) => Promise<void>;
  isLoading: boolean;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodEntry | null;
  onConfirm: (foodId: string | number) => Promise<void>;
  isLoading: boolean;
}

export interface MealSectionProps {
  section: MealSection;
  onToggleExpanded: (mealId: string) => void;
  onEditFood: (food: FoodEntry) => void;
  onDeleteFood: (food: FoodEntry) => void;
  searchQuery: string;
}

export interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}
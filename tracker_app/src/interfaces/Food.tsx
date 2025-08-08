export interface NutritionData {
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
  sugar100g?: number;
  fiber100g?: number;
  salt100g?: number;
  sodium100g?: number;
}

export interface FoodDetailProps {
  code: string;
  name: string;
  brands: string;
  quantity: string;
  categories: string;
  imageUrl: string;
  nutritionGrade: string;
  novaGroup: number;
  servingSize: string;
  nutrition: NutritionData;
  ingredients: string;
  allergens: string[];
  onAdd?: () => void;
  onDetail: (food: FoodDetailHover) => void; // Funzione per gestire il click su "Dettagli"
}

export interface FoodDetailHover {
  code: string;
  name: string;
  brands: string;
  quantity: string;
  categories: string;
  imageUrl: string;
  nutritionGrade: string;
  novaGroup: number;
  servingSize: string;
  nutrition: NutritionData;
  ingredients: string;
  allergens: string[];
}

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

export interface Food{
  Id: number;
  FoodId: number;
  UserId: number;
  Quantity: number;
  Date: Date;
  Meal: number;
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
  handleFoodHover: (food: any) => void; // Funzione per gestire il click su "Dettagli"
}

export interface FoodDetailBarcode {
  barcode: string;
  found: boolean;
  product: {
    code: string;
    name: string;
    brands: string;
    quantity: string;
    categories: string;
    imageUrl: string;
    nutritionGrade: string;
    novaGroup: number | null;
    servingSize: string | null;
    nutrition: {
      calories100g: number | null;
      protein100g: number | null;
      carbs100g: number | null;
      fat100g: number | null;
      sugar100g: number | null;
      fiber100g: number | null;
      salt100g: number | null;
      sodium100g: number | null;
    };
    ingredients: string;
    allergens: string[];
  };
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

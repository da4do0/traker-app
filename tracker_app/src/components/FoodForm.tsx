import React, { useState, useMemo, useCallback, useEffect} from "react";
import Container from "./container";
import { APIDbHandler } from "../api/APIHandler";
import { X, Utensils, Plus, Minus } from "lucide-react";
import {useUser} from "../hooks/UserInfo";

// TypeScript interfaces
interface NutritionInfo {
  calories100g: number;
  protein100g: number;
  carbs100g: number;
  fat100g: number;
}

interface Food {
  code: string;
  name: string;
  brands: string;
  categories: string;
  imageUrl: string;
  nutritionGrade: string;
  novaGroup: string;
  servingSize: string;
  nutrition: NutritionInfo;
  ingredients: string;
  allergens: string;
}

interface FoodFormProps {
  food: Food;
  back: (arg: any) => void; 
}

const FoodForm: React.FC<FoodFormProps> = ({food, back}) => {

  const [quantity, setQuantity] = useState("100");
  const [usernameLocal, setUsernameLocal] = useState("");
  const [mealType, setMealType] = useState("Lunch");

  const { username, setUsername } = useUser();

  useEffect(()=>{
    console.log("FoodForm mounted with food:", food);
    console.log("Username from hook:", username);
  }, [])

  useEffect(()=>{
    if(username === ""){
      console.error("Username is empty, please login first.");
      if(localStorage.getItem("username")){
        console.log("Setting username from localStorage: " + localStorage.getItem("username"));
        setUsername(localStorage.getItem("username") || "");
        setUsernameLocal(localStorage.getItem("username") || "");
      }
    }
  }, [username])

  // Memoized nutrition calculations for performance
  const calculatedNutrition = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const calculateValue = (value: number) =>
      Math.round(((value * qty) / 100) * 10) / 10;

    return {
      calories: calculateValue(food?.nutrition.calories100g),
      protein: calculateValue(food?.nutrition.protein100g),
      carbs: calculateValue(food?.nutrition.carbs100g),
      fat: calculateValue(food?.nutrition.fat100g),
    };
  }, [quantity, food.nutrition]);

  // Input validation
  const validationState = useMemo(() => {
    const qty = parseFloat(quantity);
    const isEmpty = quantity === "" || quantity === "0";
    const isInvalid = isNaN(qty) || qty < 0 || qty > 9999;

    return {
      isValid: !isEmpty && !isInvalid,
      isEmpty,
      isInvalid,
      errorMessage: isEmpty
        ? "Inserisci una quantità"
        : isInvalid
        ? "Quantità non valida (0-9999g)"
        : "",
    };
  }, [quantity]);

  const handleQuantityChange = useCallback((value: string) => {
    // Enhanced validation: allow only valid decimal numbers
    if (
      value === "" ||
      (/^\d*\.?\d*$/.test(value) && !value.startsWith("00"))
    ) {
      setQuantity(value);
    }
  }, []);

  const handleQuickSelect = useCallback((preset: string) => {
    setQuantity(preset);
  }, []);

  const handleIncrement = useCallback(
    (delta: number) => {
      const currentQty = parseFloat(quantity) || 0;
      const newQty = Math.max(0, Math.min(9999, currentQty + delta));
      setQuantity(newQty.toString());
    },
    [quantity]
  );

  const addFood = async ()=>{
    const foodData = {
      Name: food.name,
      Description: food.categories || "Nessuna descrizione",
      Image: food.imageUrl,
      Calories: Math.round(food.nutrition.calories100g || 0),
      Proteins: Math.round(food.nutrition.protein100g || 0),
      Carbohydrates: Math.round(food.nutrition.carbs100g || 0),
      Fats: Math.round(food.nutrition.fat100g || 0),
      code: food.code,
      Username: username || usernameLocal,
      Quantity: parseInt(quantity),
      Date: new Date().toISOString(),
      Meal: mealType,
    };

    const response = await APIDbHandler.AddFood(foodData);
    if(response){
      console.log("Food added successfully");
      back(null);
    }
  }

  return (
    <div className="max-w-[70vw] w-full max-h-[90vh] overflow-y-auto ">
      <Container css="p-4">
        {/* Header compatto */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-900/50 rounded-lg p-1.5">
              <Utensils color="green" size={18} />
            </div>
            <h2 className="text-white font-medium">{food?.name}</h2>
          </div>
            <button
              className="text-gray-400 hover:text-white p-1"
              onClick={()=>{
                back(null);
              }}
            >
              <X size={18} />
            </button>
        </div>

        {/* Layout orizzontale principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Colonna sinistra - Info e controlli */}
          <div className="space-y-3">
            {/* Info alimento compatta */}
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <img
                src={food?.imageUrl}
                alt={food?.name}
                className="w-12 h-12 object-cover rounded-lg"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs truncate">{food?.brands}</p>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Score {food?.nutritionGrade}
                </span>
              </div>
            </div>

            {/* Selezione tipo pasto */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-white text-sm font-medium mb-2">Tipo di pasto</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "Breakfast", label: "Colazione", emoji: "🌅" },
                  { value: "Lunch", label: "Pranzo", emoji: "☀️" },
                  { value: "Dinner", label: "Cena", emoji: "🌙" },
                  { value: "snack", label: "Snack", emoji: "🍎" },
                ].map((meal) => (
                  <button
                    key={meal.value}
                    onClick={() => setMealType(meal.value)}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      mealType === meal.value
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <span>{meal.emoji}</span>
                    {meal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controlli quantità compatti */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-white text-sm font-medium mb-2">Quantità</h3>

              {/* Quick select più compatto */}
              <div className="flex gap-1 mb-2">
                {["50", "100", "150", "200"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleQuickSelect(preset)}
                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                      quantity === preset
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {preset}g
                  </button>
                ))}
              </div>

              {/* Input con controlli inline */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleIncrement(-10)}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center"
                  disabled={parseFloat(quantity) <= 0}
                >
                  <Minus size={14} />
                </button>

                <div className="flex-1">
                  <input
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full bg-gray-700 text-white text-center py-1.5 px-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="100"
                  />
                  {validationState.errorMessage && (
                    <p className="text-red-400 text-xs mt-1">
                      {validationState.errorMessage}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleIncrement(10)}
                  className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded flex items-center justify-center"
                  disabled={parseFloat(quantity) >= 9999}
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-1 text-center">
                Consigliata: {food.servingSize}
              </p>
            </div>

            {/* Info prodotto compatta */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h4 className="text-white text-sm font-medium mb-2">Dettagli</h4>
              <div className="text-gray-300 text-xs space-y-1">
                <p>
                  <span className="text-gray-400">Categoria:</span>{" "}
                  {food.categories}
                </p>
                <p>
                  <span className="text-gray-400">Allergeni:</span>{" "}
                  {food.allergens}
                </p>
              </div>
            </div>
          </div>

          {/* Colonna destra - Valori nutrizionali */}
          <div className="space-y-3">
            {/* Calorie hero compatte */}
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-lg p-3">
              <div className="text-center">
                <p className="text-red-300 text-xs font-medium">
                  Calorie per {quantity || "0"}g
                </p>
                <p className="text-white text-2xl font-bold" aria-live="polite">
                  {calculatedNutrition?.calories}{" "}
                  <span className="text-sm font-normal">kcal</span>
                </p>
                <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        100,
                        (calculatedNutrition?.calories / 2000) * 100
                      )}%`
                    }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {Math.round((calculatedNutrition?.calories / 2000) * 100)}% del
                  fabbisogno
                </p>
              </div>
            </div>

            {/* Macronutrienti compatti */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-2 text-center">
                <p className="text-blue-300 text-xs">Proteine</p>
                <p className="text-white text-sm font-bold">
                  {calculatedNutrition.protein}g
                </p>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-2 text-center">
                <p className="text-yellow-300 text-xs">Carbs</p>
                <p className="text-white text-sm font-bold">
                  {calculatedNutrition.carbs}g
                </p>
              </div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-2 text-center">
                <p className="text-purple-300 text-xs">Grassi</p>
                <p className="text-white text-sm font-bold">
                  {calculatedNutrition.fat}g
                </p>
              </div>
            </div>

            <button
              onClick={addFood}
              disabled={!validationState.isValid}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-500 text-white py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>✓</span>
              Aggiungi {quantity || "0"}g
            </button>
            {/* Pulsanti azione */}
            {/* <div className="space-y-2">

              <div className="flex gap-2">
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-3 rounded-lg text-sm transition-colors border border-gray-600">
                  Salva
                </button>
                {onToggleFavorite && (
                  <button
                    onClick={handleToggleFavorite}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    ❤️
                  </button>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FoodForm;
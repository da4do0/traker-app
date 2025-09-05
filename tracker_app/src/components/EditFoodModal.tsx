import React, { useState, useEffect } from 'react';
import { X, Save, Scale } from 'lucide-react';
import Container from './container';
import type { EditFoodModalProps, EditFoodData, MealType } from '../types/FoodList';
import { APIDbHandler } from "../api/APIHandler";

const MEAL_TYPES: MealType[] = [
  { id: "Colazione", name: "Colazione", emoji: "🌅", color: "yellow" },
  { id: "Pranzo", name: "Pranzo", emoji: "☀️", color: "orange" },
  { id: "Cena", name: "Cena", emoji: "🌙", color: "purple" },
  { id: "Spuntino", name: "Spuntini", emoji: "🍎", color: "green" }
] as const;

const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  onClose,
  food,
  onSave,
  isLoading
}) => {
  const [quantity, setQuantity] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState("Colazione");
  const [errors, setErrors] = useState<{ quantity?: string }>({});

  useEffect(() => {
    if (food) {
      console.log("EditFoodModal opened for food:", food);
      setQuantity(food.quantity);
      setSelectedMeal(food.meal);
      setErrors({});
    }
  }, [food]);

  const validateQuantity = (value: number): string | null => {
    if (value <= 0) return "La quantità deve essere maggiore di 0";
    if (value > 9999) return "La quantità non può superare 9999g";
    return null;
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value);
    setQuantity(isNaN(numValue) ? 0 : numValue);
    
    const error = validateQuantity(numValue);
    setErrors(prev => ({ ...prev, quantity: error || undefined }));
  };

  const handleSave = async () => {
    if (!food) return;
    
    console.log(`🍽️ [EditModal] handleSave called for food:`, food);
    console.log(`🍽️ [EditModal] Current values - quantity: ${quantity}, selectedMeal: ${selectedMeal}`);
    
    const quantityError = validateQuantity(quantity);
    if (quantityError) {
      setErrors({ quantity: quantityError });
      return;
    }

    const data: EditFoodData = {
      id: food.id,
      quantity,
      meal: selectedMeal
    };

    console.log(`🍽️ [EditModal] Saving data:`, data);
    console.log(`🍽️ [EditModal] selectedMeal value: '${selectedMeal}' (type: ${typeof selectedMeal})`);

    await onSave(data);
  };

  const calculateNewNutrition = () => {
    if (!food) return null;
    
    const ratio = quantity / 100; // Assuming base values are per 100g
    return {
      calories: Math.round(food.calories * ratio),
      proteins: Math.round(food.proteins * ratio * 10) / 10,
      carbohydrates: Math.round(food.carbohydrates * ratio * 10) / 10,
      fats: Math.round(food.fats * ratio * 10) / 10
    };
  };

  if (!isOpen || !food) return null;

  const newNutrition = calculateNewNutrition();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Container css="w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900/50 rounded-lg p-2">
              <Scale className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Modifica Alimento</h2>
              <p className="text-gray-400 text-sm">{food.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quantity Input */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Quantità (g)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white ${
              errors.quantity ? 'border-red-500' : 'border-gray-600'
            } focus:border-blue-500 focus:outline-none`}
            min="1"
            max="9999"
            step="1"
            disabled={isLoading}
          />
          {errors.quantity && (
            <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
          )}
        </div>

        {/* Meal Selection */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Pasto
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((meal) => (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedMeal === meal.id
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meal.emoji}</span>
                  <span className="text-white text-sm">{meal.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Preview */}
        {newNutrition && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <h3 className="text-gray-300 text-sm font-medium mb-2">Valori Nutrizionali Aggiornati</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-orange-400">
                <span className="text-gray-400">Calorie:</span> {newNutrition.calories} kcal
              </div>
              <div className="text-blue-400">
                <span className="text-gray-400">Proteine:</span> {newNutrition.proteins}g
              </div>
              <div className="text-green-400">
                <span className="text-gray-400">Carboidrati:</span> {newNutrition.carbohydrates}g
              </div>
              <div className="text-purple-400">
                <span className="text-gray-400">Grassi:</span> {newNutrition.fats}g
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isLoading || !!errors.quantity}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save size={16} />
                Salva
              </>
            )}
          </button>
        </div>
      </Container>
    </div>
  );
};

export default EditFoodModal;
import React, { useState, useMemo, useCallback } from "react";
import Container from "./container";
import Input from "./input";
import { APIDbHandler } from "../api/APIHandler";
import { X, Utensils, Plus, Minus, Apple, Camera } from "lucide-react";
import { useUser } from "../hooks/UserInfo";

interface CustomFoodFormProps {
  onClose: () => void;
  onFoodCreated?: (food: any) => void;
}

const CustomFoodForm: React.FC<CustomFoodFormProps> = ({ onClose, onFoodCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    calories: "",
    proteins: "",
    carbohydrates: "",
    fats: "",
    servingSize: "100",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validationState = useMemo(() => {
    const { name, calories, proteins, carbohydrates, fats } = formData;
    
    const isFormValid = 
      name.trim() !== "" &&
      !isNaN(parseFloat(calories)) && parseFloat(calories) >= 0 &&
      !isNaN(parseFloat(proteins)) && parseFloat(proteins) >= 0 &&
      !isNaN(parseFloat(carbohydrates)) && parseFloat(carbohydrates) >= 0 &&
      !isNaN(parseFloat(fats)) && parseFloat(fats) >= 0;

    return {
      isValid: isFormValid,
      errors: {
        name: name.trim() === "" ? "Nome obbligatorio" : "",
        calories: isNaN(parseFloat(calories)) || parseFloat(calories) < 0 ? "Calorie non valide" : "",
        proteins: isNaN(parseFloat(proteins)) || parseFloat(proteins) < 0 ? "Proteine non valide" : "",
        carbohydrates: isNaN(parseFloat(carbohydrates)) || parseFloat(carbohydrates) < 0 ? "Carboidrati non validi" : "",
        fats: isNaN(parseFloat(fats)) || parseFloat(fats) < 0 ? "Grassi non validi" : "",
      }
    };
  }, [formData]);

  // Nutrition values (per 100g)
  const nutritionValues = useMemo(() => {
    const calories = parseFloat(formData.calories) || 0;
    const proteins = parseFloat(formData.proteins) || 0;
    const carbs = parseFloat(formData.carbohydrates) || 0;
    const fats = parseFloat(formData.fats) || 0;

    return {
      calories: Math.round(calories * 10) / 10,
      proteins: Math.round(proteins * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fats: Math.round(fats * 10) / 10,
    };
  }, [formData]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!validationState.isValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const foodData = {
        Name: formData.name.trim(),
        Description: formData.description.trim() || "Alimento personalizzato",
        Image: formData.imageUrl.trim() || "https://via.placeholder.com/150",
        Calories: Math.round(parseFloat(formData.calories)),
        Proteins: Math.round(parseFloat(formData.proteins)),
        Carbohydrates: Math.round(parseFloat(formData.carbohydrates)),
        Fats: Math.round(parseFloat(formData.fats)),
        code: `custom_${Date.now()}`,
      };

      // Crea solo il cibo personalizzato
      const response = await APIDbHandler.AddCustomFood(foodData);
      
      if (response) {
        console.log("Custom food created successfully");
        onFoodCreated?.(foodData);
        onClose();
      } else {
        console.error("Failed to create custom food");
      }
    } catch (error) {
      console.error("Error adding custom food:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Container css="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-900/50 rounded-lg p-1.5">
                <Apple className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-white font-medium">Crea Alimento Personalizzato</h2>
            </div>
            <button
              className="text-gray-400 hover:text-white p-1"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white text-sm font-medium mb-3">Informazioni Base</h3>
                <div className="space-y-3">
                  <Input
                    label="Nome Alimento"
                    value={formData.name}
                    onChange={(value) => handleInputChange("name", value)}
                    placeHolder="es. Pasta integrale fatta in casa"
                  >
                    <Utensils className="w-4 h-4 text-gray-400" />
                  </Input>
                  
                  <Input
                    label="Descrizione (opzionale)"
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                    placeHolder="es. Pasta preparata con farina integrale"
                  >
                    <Utensils className="w-4 h-4 text-gray-400" />
                  </Input>

                  <Input
                    label="URL Immagine (opzionale)"
                    value={formData.imageUrl}
                    onChange={(value) => handleInputChange("imageUrl", value)}
                    placeHolder="https://..."
                  >
                    <Camera className="w-4 h-4 text-gray-400" />
                  </Input>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white text-sm font-medium mb-3">Valori Nutrizionali (per 100g)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Calorie"
                    value={formData.calories}
                    onChange={(value) => handleInputChange("calories", value)}
                    placeHolder="0"
                    type="number"
                  >
                    <span className="text-red-400 text-xs">kcal</span>
                  </Input>

                  <Input
                    label="Proteine (g)"
                    value={formData.proteins}
                    onChange={(value) => handleInputChange("proteins", value)}
                    placeHolder="0"
                    type="number"
                  >
                    <span className="text-blue-400 text-xs">P</span>
                  </Input>

                  <Input
                    label="Carboidrati (g)"
                    value={formData.carbohydrates}
                    onChange={(value) => handleInputChange("carbohydrates", value)}
                    placeHolder="0"
                    type="number"
                  >
                    <span className="text-yellow-400 text-xs">C</span>
                  </Input>

                  <Input
                    label="Grassi (g)"
                    value={formData.fats}
                    onChange={(value) => handleInputChange("fats", value)}
                    placeHolder="0"
                    type="number"
                  >
                    <span className="text-purple-400 text-xs">G</span>
                  </Input>
                </div>
              </div>

            </div>

            {/* Right Column - Quantity & Preview */}
            <div className="space-y-4">
              {/* Quantity Controls */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-white text-sm font-medium mb-3">Quantità</h3>
                

                {/* Quantity input with controls */}
                <div className="flex items-center gap-2">

                  <div className="flex-1">
                    <input
                      className="w-full bg-gray-700 text-white text-center py-2 px-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

              {/* Nutrition Preview */}
              <div className="space-y-3">
                {/* Calories */}
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-red-300 text-xs font-medium">
                      Calorie per {/* {quantity || "0"} */}g
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {formData?.calories}{" "}
                      <span className="text-sm font-normal">kcal</span>
                    </p>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-2 text-center">
                    <p className="text-blue-300 text-xs">Proteine</p>
                    <p className="text-white text-sm font-bold">
                      {formData.proteins}g
                    </p>
                  </div>
                  <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-2 text-center">
                    <p className="text-yellow-300 text-xs">Carbs</p>
                    <p className="text-white text-sm font-bold">
                      {formData.carbohydrates}g
                    </p>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg p-2 text-center">
                    <p className="text-purple-300 text-xs">Grassi</p>
                    <p className="text-white text-sm font-bold">
                      {formData.fats}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Messages */}
              {/* {Object.values(validationState.errors).some(error => error) && (
                <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
                  <p className="text-red-300 text-sm font-medium mb-1">Errori nel form:</p>
                  {Object.values(validationState.errors).map((error, index) => 
                    error && (
                      <p key={index} className="text-red-400 text-xs">• {error}</p>
                    )
                  )}
                </div>
              )}
 */}
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSubmit}
                  disabled={!validationState.isValid || isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    validationState.isValid && !isSubmitting
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Crea
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default CustomFoodForm;
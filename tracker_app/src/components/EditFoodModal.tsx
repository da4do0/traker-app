import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import type { EditFoodModalProps, EditFoodData, MealType } from '../types/FoodList';
import { Btn, CloseBtn, Dot, IconBtn, Modal, Seg, fmt } from './ui';

const MEAL_TYPES: MealType[] = [
  { id: "Colazione", name: "Colazione", emoji: "🌅", color: "yellow" },
  { id: "Pranzo", name: "Pranzo", emoji: "☀️", color: "orange" },
  { id: "Cena", name: "Cena", emoji: "🌙", color: "purple" },
  { id: "Spuntino", name: "Spuntino", emoji: "🍎", color: "green" }
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

    await onSave(data);
  };

  const calculateNewNutrition = () => {
    if (!food) return null;

    // i valori di `food` sono già riferiti alla quantità registrata (non a 100 g)
    const ratio = food.quantity ? quantity / food.quantity : 0;
    return {
      calories: Math.round(food.calories * ratio),
      proteins: Math.round(food.proteins * ratio * 10) / 10,
      carbohydrates: Math.round(food.carbohydrates * ratio * 10) / 10,
      fats: Math.round(food.fats * ratio * 10) / 10
    };
  };

  if (!isOpen || !food) return null;

  const newNutrition = calculateNewNutrition()!;
  const delta = newNutrition.calories - food.calories;
  const close = isLoading ? () => {} : onClose;

  return (
    <Modal onClose={close} width={520}>
      {/* Header */}
      <div className="-mt-[6px] flex items-start justify-between lg:mt-1">
        <div className="mt-[2px] min-w-0 lg:mt-0">
          <h2 className="t-title">Modifica</h2>
          <p className="t-label-s mt-1 truncate text-ink2">{food.name} · {food.meal}</p>
        </div>
        <CloseBtn onClick={onClose} disabled={isLoading} />
      </div>

      {/* Quantity */}
      <span className="t-label mt-[26px] block text-ink2 lg:mt-[34px]">QUANTITÀ</span>
      <div className="mt-[10px] flex items-center">
        <IconBtn size={56} aria-label="Meno 10 g" onClick={() => handleQuantityChange(String(Math.max(0, quantity - 10)))} disabled={isLoading || quantity <= 0}>
          <Minus size={22} strokeWidth={1.75} />
        </IconBtn>
        <label className="relative mx-auto flex cursor-text items-end gap-2">
          <Dot text={fmt(quantity, quantity % 1 ? 1 : 0)} p={7} />
          <span className="t-label pb-[2px] text-ink2">G</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            min="1"
            max="9999"
            step="1"
            disabled={isLoading}
            aria-label="Quantità in grammi"
            className="absolute inset-0 w-full cursor-text bg-transparent text-transparent caret-ink outline-none"
          />
        </label>
        <IconBtn size={56} aria-label="Più 10 g" onClick={() => handleQuantityChange(String(Math.min(9999, quantity + 10)))} disabled={isLoading || quantity >= 9999}>
          <Plus size={22} strokeWidth={1.75} />
        </IconBtn>
      </div>
      <p className={`t-body-s mt-4 text-center lg:mt-[14px] ${errors.quantity ? "text-signal" : "text-ink2"}`}>
        {errors.quantity || `Prima: ${fmt(food.quantity)} g`}
      </p>

      {/* Meal Selection */}
      <span className="t-label mt-[18px] block text-ink2 lg:mt-5">PASTO</span>
      <Seg className="mt-2" value={selectedMeal} onChange={(v) => !isLoading && setSelectedMeal(v)}
        options={MEAL_TYPES.map((m) => ({ value: m.id, label: m.name }))} />

      {/* Nutrition Preview */}
      <div className="mt-5 rounded-[20px] bg-control px-5 pb-5 pt-[14px]">
        <div className="flex items-center justify-between">
          <span className="t-label text-ink2">VALORI AGGIORNATI</span>
          <span className="t-data-l">{fmt(newNutrition.calories)} KCAL</span>
        </div>
        <div className="mt-[18px] flex justify-between">
          <span className="t-label-s">P {fmt(newNutrition.proteins, 1)} · C {fmt(newNutrition.carbohydrates, 1)} · G {fmt(newNutrition.fats, 1)}</span>
          <span className="t-label-s text-ink2">{delta >= 0 ? "+" : "−"}{fmt(Math.abs(delta))} KCAL</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 mt-[34px] flex gap-4 lg:-mb-2 lg:mt-[26px] lg:justify-end">
        <Btn kind="secondary" onClick={onClose} disabled={isLoading} className="flex-1 lg:w-[160px] lg:flex-none">Annulla</Btn>
        <Btn onClick={handleSave} disabled={isLoading || !!errors.quantity} className="flex-1 lg:w-[160px] lg:flex-none">
          {isLoading ? <span className="size-4 animate-spin rounded-full border-2 border-void border-t-transparent" /> : "Salva"}
        </Btn>
      </div>
    </Modal>
  );
};

export default EditFoodModal;

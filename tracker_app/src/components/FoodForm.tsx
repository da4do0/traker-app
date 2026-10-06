import React, { useState, useMemo, useCallback, useEffect} from "react";
import { APIDbHandler } from "../api/APIHandler";
import { Plus, Minus } from "lucide-react";
import {useUser} from "../hooks/UserInfo";
import type { FoodDetailHover } from "../types/Food";
import { Btn, CloseBtn, Dot, Glyph, IconBtn, Modal, Monogram, Seg, fmt, useIsDesktop } from "./ui";
import { portionGrams } from "./FoodPanel";

interface FoodFormProps {
  food: FoodDetailHover;
  back: (arg: any) => void;
  onSuccess?: () => void;
}

const MEAL_OPTIONS = [
  { value: "Breakfast", label: "Colazione" },
  { value: "Lunch", label: "Pranzo" },
  { value: "Dinner", label: "Cena" },
  { value: "Snack", label: "Spuntino" },
];

const FoodForm: React.FC<FoodFormProps> = ({food, back, onSuccess}) => {

  const [quantity, setQuantity] = useState("100");
  const [usernameLocal, setUsernameLocal] = useState("");
  const [mealType, setMealType] = useState("Lunch");
  const [today, setToday] = useState<{ eaten: number; goal: number } | null>(null);

  const { userId, username, setUsername } = useUser();
  const desktop = useIsDesktop();

  useEffect(()=>{
    if(username === ""){
      console.error("Username is empty, please login first.");
      if(localStorage.getItem("username")){
        setUsername(localStorage.getItem("username") || "");
        setUsernameLocal(localStorage.getItem("username") || "");
      }
    }
  }, [username])

  // Kcal già mangiate oggi e quota (API esistente InfoUser) per "Dopo l'aggiunta"
  useEffect(() => {
    if (!userId) return;
    APIDbHandler.InfoUser(userId)
      .then((r) => setToday({
        goal: r?.userInfo?.dailyCalorieGoal ?? 0,
        eaten: (r?.data?.food ?? []).reduce((t: number, i: any) => t + (i.food?.calories ?? 0) * i.quantity / 100, 0),
      }))
      .catch(() => setToday(null));
  }, [userId]);

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

    try {
      const response = await APIDbHandler.AddFood(foodData);
      if(response){
        onSuccess?.();
        back(null);
      }
    } catch (error) {
      console.error("Error adding food:", error);
      // You could add error handling here (toast, alert, etc.)
    }
  }

  // ---------- anteprima "Dopo l'aggiunta"
  const N = desktop ? 40 : 34;
  const portion = portionGrams(food.servingSize);
  const lit = today?.goal ? Math.min(N, Math.round((today.eaten / today.goal) * N)) : 0;
  const after = today?.goal ? Math.min(N, Math.round(((today.eaten + calculatedNutrition.calories) / today.goal) * N)) : 0;
  const left = today ? Math.round(today.goal - today.eaten - calculatedNutrition.calories) : 0;
  const shownQty = quantity === "" ? "0" : quantity.replace(".", ",");

  return (
    <Modal onClose={() => back(null)}>
      {/* Intestazione */}
      <div className="flex items-center gap-3 lg:gap-4">
        <Monogram name={food?.name} size={desktop ? 52 : 48} p={desktop ? 3.4 : 3.2} r={desktop ? 14 : 12} />
        <div className="min-w-0 flex-1">
          <h2 className={`${desktop ? "t-title" : "t-strong"} truncate`}>{food?.name}</h2>
          <p className="t-label-s mt-1 truncate text-ink2">{[food?.brands, `${fmt(Math.round(food?.nutrition.calories100g ?? 0))} KCAL/100 G`].filter(Boolean).join(" · ").toUpperCase()}</p>
        </div>
        <CloseBtn onClick={() => back(null)} />
      </div>

      {/* Pasto */}
      <span className="t-label mt-[22px] block text-ink2 lg:mt-7">PASTO</span>
      <Seg className="mt-2" value={mealType} onChange={setMealType} options={MEAL_OPTIONS} />

      {/* Quantità */}
      <span className="t-label mt-6 block text-ink2 lg:mt-[26px]">QUANTITÀ</span>
      <div className="mt-[10px] flex items-center">
        <IconBtn size={56} aria-label="Meno 10 g" onClick={() => handleIncrement(-10)} disabled={parseFloat(quantity) <= 0}><Minus size={22} strokeWidth={1.75} /></IconBtn>
        <label className="relative mx-auto flex cursor-text items-end gap-2">
          <Dot text={shownQty} p={7} />
          <span className="t-label pb-[2px] text-ink2">G</span>
          {/* il numero dot-matrix è la vista; l'input trasparente sopra riceve la digitazione */}
          <input
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value.replace(",", "."))}
            inputMode="decimal"
            aria-label="Quantità in grammi"
            className="absolute inset-0 w-full cursor-text bg-transparent text-transparent caret-ink outline-none"
          />
        </label>
        <IconBtn size={56} aria-label="Più 10 g" onClick={() => handleIncrement(10)} disabled={parseFloat(quantity) >= 9999}><Plus size={22} strokeWidth={1.75} /></IconBtn>
      </div>
      {validationState.errorMessage && <p className="t-body-s mt-2 text-center text-signal">{validationState.errorMessage}</p>}
      <div className="mt-[18px] grid grid-cols-4 gap-2">
        {["50", "100", "150", "200"].map((preset) => (
          <button key={preset} onClick={() => handleQuickSelect(preset)}
            className={`t-label h-9 cursor-pointer rounded-full border ${quantity === preset ? "border-ink" : "border-ink3"}`}>
            {preset} G
          </button>
        ))}
      </div>
      {portion > 0 && <p className="t-body-s mt-[10px] text-ink2">Porzione in etichetta: {fmt(portion)} g</p>}

      {/* Dopo l'aggiunta */}
      <div className="mt-[16px] rounded-[20px] bg-control px-5 pb-[18px] pt-[18px]">
        <div className="flex justify-between">
          <span className="t-label text-ink2">DOPO L’AGGIUNTA</span>
          {today && <span className={`t-label ${left < 0 ? "text-signal" : ""}`}>{left < 0 ? `OLTRE DI ${fmt(-left)} KCAL` : `RESTANO ${fmt(left)} KCAL`}</span>}
        </div>
        <Glyph className="mt-[14px]" total={N} h={20} gap={desktop ? 3 : 3.1} groupGap={desktop ? 3 : 3.1} groups={[{ n: lit }]} outline={Math.max(0, after - lit)} />
        <p className="t-label-s mt-[18px]">
          +{fmt(Math.round(calculatedNutrition.calories))} KCAL · P {fmt(calculatedNutrition.protein, 1)} · C {fmt(calculatedNutrition.carbs, 1)} · G {fmt(calculatedNutrition.fat, 1)}
        </p>
      </div>

      {/* Azioni */}
      <div className="mt-[22px] flex gap-4 lg:mt-[46px] lg:justify-between">
        {desktop && <Btn kind="secondary" className="w-[160px]" onClick={() => back(null)}>Annulla</Btn>}
        <Btn icon={<Plus size={20} />} onClick={addFood} disabled={!validationState.isValid} className="flex-1 lg:w-[240px] lg:flex-none">
          Aggiungi {quantity || "0"} g
        </Btn>
      </div>
    </Modal>
  );
};

export default FoodForm;

import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash } from "lucide-react";
import type { FoodEntry, MealSectionProps } from "../types/FoodList";
import { Btn, IconBtn, fmt, useIsDesktop } from "./ui";

const MealSection: React.FC<MealSectionProps> = ({
  section,
  onToggleExpanded,
  onEditFood,
  onDeleteFood,
  searchQuery,
}) => {
  const navigate = useNavigate();
  const desktop = useIsDesktop();

  // Filter foods based on search query
  const filteredFoods = section.foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.description &&
        food.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const hasFilteredFoods = filteredFoods.length > 0;

  if (searchQuery && !hasFilteredFoods) {
    return null; // Don't render section if no foods match search
  }

  const tile = "rounded-[28px] bg-tile px-5 pt-[22px] lg:rounded-[32px] lg:px-8";
  const add = (cls: string) => (
    <Btn kind="secondary" size="M" icon={<Plus size={20} strokeWidth={1.5} />} onClick={() => navigate("/food")} className={`!px-0 ${cls}`}>Aggiungi</Btn>
  );

  // Pasto vuoto: niente toggle, invito ad aggiungere
  if (section.foods.length === 0) {
    return (
      <section className={`${tile} pb-[30px] lg:pb-8`}>
        {desktop ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-7"><h3 className="t-title">{section.name}</h3><span className="t-label text-ink2">VUOTO</span></div>
              <p className="t-body-s mt-[14px] text-ink2">Nessun alimento registrato per {section.name.toLowerCase()}.</p>
            </div>
            {add("mt-[10px] !h-10 w-[124px]")}
          </div>
        ) : (
          <>
            <h3 className="t-title">{section.name}</h3>
            <p className="t-label-s mt-[2px] text-ink2">VUOTO</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="t-body-s text-ink2">Nessun alimento.</p>
              {add("!h-9 w-[100px]")}
            </div>
          </>
        )}
      </section>
    );
  }

  const count = `${filteredFoods.length} ${filteredFoods.length === 1 ? "ALIMENTO" : "ALIMENTI"} · ${fmt(section.totalCalories)} KCAL`;
  const actions = (food: FoodEntry) => (
    <div className="flex shrink-0 gap-2">
      <IconBtn size={32} title="Modifica" aria-label={`Modifica ${food.name}`} onClick={(e) => { e.stopPropagation(); onEditFood(food); }}>
        <Pencil size={15} strokeWidth={1.6} />
      </IconBtn>
      <IconBtn size={32} title="Elimina" aria-label={`Elimina ${food.name}`} onClick={(e) => { e.stopPropagation(); onDeleteFood(food); }}>
        <Trash size={15} strokeWidth={1.6} />
      </IconBtn>
    </div>
  );
  const Chevron = section.expanded ? ChevronUp : ChevronDown;

  return (
    <section className={`${tile} pb-[22px] ${section.expanded ? "lg:pb-3" : ""}`}>
      {/* Section Header */}
      <button
        className="flex w-full cursor-pointer items-start justify-between text-left lg:items-center"
        onClick={() => onToggleExpanded(section.id)}
        aria-expanded={section.expanded}
      >
        <span className="lg:flex lg:items-center lg:gap-7">
          <h3 className="t-title">{section.name}</h3>
          <span className="t-label-s mt-[2px] block text-ink2 lg:t-label lg:mt-0">{count}</span>
        </span>
        <Chevron size={18} strokeWidth={1.75} className="mt-[6px] shrink-0 text-ink2 lg:mt-0" />
      </button>

      {/* Foods List */}
      {section.expanded && (desktop ? (
        <div className="mt-6">
          <div className="t-label-s flex pb-3 text-ink2">
            <span className="flex-1">ALIMENTO</span>
            <span className="w-20 text-right">QUANTITÀ</span>
            <span className="w-20 text-right">KCAL</span>
            {["P", "C", "G"].map((k) => <span key={k} className="w-[60px] text-right">{k}</span>)}
            <span className="w-[101px]" />
          </div>
          {filteredFoods.map((food) => (
            <div key={food.id} className="flex h-[52px] items-center border-t border-line">
              <span className="t-strong min-w-0 flex-1 truncate">{food.name}</span>
              <span className="t-data w-20 text-right text-ink2">{fmt(food.quantity)} G</span>
              <span className="t-data w-20 text-right">{fmt(food.calories)}</span>
              {[food.proteins, food.carbohydrates, food.fats].map((v, i) => (
                <span key={i} className="t-data w-[60px] text-right text-ink2">{fmt(v, 1)}</span>
              ))}
              <span className="ml-[29px]">{actions(food)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[10px]">
          {filteredFoods.map((food) => (
            <div key={food.id} className="flex items-center gap-[10px] border-t border-line pb-[14px] pt-[11px] last:pb-0">
              <div className="min-w-0 flex-1">
                <h4 className="t-strong truncate">{food.name}</h4>
                <p className="t-label-s mt-[2px] text-ink2">{fmt(food.quantity)} G</p>
              </div>
              <span className="t-data shrink-0 text-right">{fmt(food.calories)} KCAL</span>
              {actions(food)}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
};

export default MealSection;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import type { FoodDetailProps } from "../types/Food";
import { IconBtn, Monogram, fmt } from "./ui";

type Props = FoodDetailProps & { index?: number; total?: number; selected?: boolean; onSelect?: () => void };

const FoodDetail: React.FC<Props> = ({
  code,
  name,
  brands,
  quantity,
  categories,
  imageUrl,
  nutritionGrade,
  novaGroup,
  servingSize,
  nutrition,
  ingredients,
  allergens,
  handleFoodHover,
  index,
  total,
  selected,
  onSelect,
}) => {
  const navigate = useNavigate();
  const food = { code, name, brands, quantity, categories, imageUrl, nutritionGrade, novaGroup, servingSize, nutrition, ingredients, allergens };

  const handleDetailClick = () => {
    // desktop: split view (selezione locale); mobile: pagina dettaglio
    if (onSelect) return onSelect();
    navigate(`/food/${code}`, { state: { food, index, total } });
  };

  const grade = nutritionGrade?.toUpperCase();

  return (
    <div
      className={`flex cursor-pointer items-start gap-[14px] pb-[14px] pt-[15px] lg:-mx-3 lg:mb-[2px] lg:mt-px lg:h-24 lg:gap-4 lg:rounded-3xl lg:p-4 ${selected ? "bg-tile" : "lg:hover:bg-tile/60"}`}
      onClick={handleDetailClick}
    >
      <Monogram name={name} size={60} p={4} bg={selected ? "bg-control" : "bg-tile"} />

      <div className="min-w-0 flex-1">
        <h3 className="t-strong truncate">{name}</h3>
        <p className="t-label-s mt-[2px] truncate text-ink2">{brands?.toUpperCase()}</p>
        <p className="t-label-s mt-[6px] whitespace-nowrap">
          {fmt(Math.round(nutrition?.calories100g ?? 0))} KCAL · P {fmt(nutrition?.protein100g ?? 0, 1)} · C {fmt(nutrition?.carbs100g ?? 0, 1)} · G {fmt(nutrition?.fat100g ?? 0, 1)}
        </p>
        <div className="mt-[6px] flex items-center gap-2">
          <span className="flex gap-[2px]">
            {["A", "B", "C", "D", "E"].map((l) => (
              <span key={l} className={`t-label-s flex h-4 w-[14px] items-center justify-center rounded-[3px] ${l === grade ? "bg-ink text-void" : selected ? "bg-dotoff text-ink2" : "bg-control text-ink2"}`}>{l}</span>
            ))}
          </span>
          <span className="t-label-s text-ink2 lg:hidden">NUTRI-SCORE</span>
        </div>
      </div>

      <IconBtn
        className="mt-3 lg:mt-[10px]"
        aria-label={`Aggiungi ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          handleFoodHover(food);
        }}
      >
        <Plus size={20} strokeWidth={2} />
      </IconBtn>
    </div>
  );
};

export default FoodDetail;

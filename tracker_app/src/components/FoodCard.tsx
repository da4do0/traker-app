import React from "react";
import ButtonContainer from "./ButtonContainer";
import { Plus } from "lucide-react";

interface FoodCardProps {
  name: string;
  type: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  typeColor?:
    | "red"
    | "yellow"
    | "green"
    | "purple"
    | "orange"
    | "blue";
}

const badgeColorMap: Record<string, string> = {
  red: "bg-red-300 border border-red-500 text-red-500",
  yellow: "bg-yellow-200 border border-yellow-500 text-yellow-700",
  green: "bg-green-300 border border-green-500 text-green-700",
  purple: "bg-purple-200 border border-purple-500 text-purple-700",
  orange: "bg-orange-200 border border-orange-500 text-orange-700",
  blue: "bg-blue-200 border border-blue-500 text-blue-700",
};

const FoodCard: React.FC<FoodCardProps> = ({ name, type, kcal, protein, carbs, fat, typeColor = "red" }) => {
  const badgeClass = badgeColorMap[typeColor] || badgeColorMap["red"];
  return (
    <ButtonContainer color="gray">
      <div className="flex flex-col w-full gap-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">{name}</span>
            <span className={`${badgeClass} text-[12px] font-medium px-2 py-0.5 rounded-3xl`}>{type}</span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 transition-colors rounded-lg p-2 flex items-center justify-center">
            <Plus color="white" size={22} />
          </button>
        </div>
        <div className="flex flex-row flex-wrap gap-x-8 gap-y-1 text-slate-200 text-[15px] font-normal">
          <span>{kcal} kcal</span>
          <span className="text-slate-400">P: <span className="text-slate-200">{protein}g</span></span>
          <span className="text-slate-400">C: <span className="text-slate-200">{carbs}g</span></span>
          <span className="text-slate-400">G: <span className="text-slate-200">{fat}g</span></span>
        </div>
      </div>
    </ButtonContainer>
  );
};

export default FoodCard; 
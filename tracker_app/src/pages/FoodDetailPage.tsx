import React, { useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import FoodForm from "../components/FoodForm";
import { FoodPanel, FoodTiles } from "../components/FoodPanel";
import Shell from "../components/Shell";
import { Btn, useIsDesktop } from "../components/ui";
import type { FoodDetailHover } from "../types/Food";

const FoodDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const food = location.state?.food as FoodDetailHover;
  const { index, total } = location.state ?? {};
  const [showFoodForm, setShowFoodForm] = useState(false);
  const desktop = useIsDesktop();

  const handleFoodAdded = () => {
    setShowFoodForm(false);
    // Optionally navigate back to home or show success message
    navigate("/");
  };

  if (!food) return <Navigate to="/food" />;

  const top = (
    <div className="flex items-center justify-between px-1 lg:mb-6 lg:max-w-[629px] lg:px-0">
      <button onClick={() => navigate(-1)} aria-label="Torna alla ricerca" className="cursor-pointer"><ArrowLeft size={22} strokeWidth={1.5} /></button>
      {index && <span className="t-label text-ink2">RISULTATO {index} DI {total}</span>}
    </div>
  );

  const form = showFoodForm && (
    <FoodForm
      food={food}
      back={() => setShowFoodForm(false)}
      onSuccess={handleFoodAdded}
    />
  );

  // desktop: di norma il dettaglio è nello split view di /food; qui per link diretti
  if (desktop) {
    return (
      <Shell>
        {top}
        <div className="max-w-[629px]"><FoodPanel food={food} onAdd={() => setShowFoodForm(true)} /></div>
        {form}
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-void px-4 pb-[134px] pt-[15px] text-ink">
      {top}
      <div className="mt-5"><FoodTiles food={food} /></div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-void px-5 pb-10 pt-[18px]">
        <Btn icon={<Plus size={20} strokeWidth={2} />} className="w-full" onClick={() => setShowFoodForm(true)}>Aggiungi al diario</Btn>
      </div>
      {form}
    </div>
  );
};

export default FoodDetailPage;

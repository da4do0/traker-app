import React, { useState, useMemo, useCallback } from "react";
import { APIDbHandler } from "../api/APIHandler";
import { X, ImageIcon } from "lucide-react";
import { Btn, CloseBtn, Dot, DotBar, Field, Modal, RDot, fmt, useIsDesktop } from "./ui";

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
  const desktop = useIsDesktop();

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

  // ---------- UI
  const { calories, proteins, carbs, fats } = nutritionValues;
  const energy = carbs * 4 + proteins * 4 + fats * 9;
  const pct = (kcal: number) => (energy ? Math.round((kcal / energy) * 100) : 0);
  const dots = desktop ? 20 : 16;
  const macros = [
    { k: "CARBO", g: carbs, p: pct(carbs * 4) },
    { k: "PROT", g: proteins, p: pct(proteins * 4) },
    { k: "GRASSI", g: fats, p: pct(fats * 9) },
  ];

  const num = (field: "calories" | "proteins" | "carbohydrates" | "fats", label: string, unit: string) => (
    <Field label={label} unit={unit} type="number" inputMode="decimal" min="0" step="0.1" placeholder="0"
      value={formData[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
  );

  const fields = (
    <div className="flex flex-col gap-[22px]">
      <Field label="NOME" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="es. Pasta integrale fatta in casa" />
      <Field label="DESCRIZIONE · FACOLTATIVA" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="es. Farina integrale e uova" />
      <Field label="URL IMMAGINE · FACOLTATIVO" icon={<ImageIcon size={20} strokeWidth={1.5} />} value={formData.imageUrl} onChange={(e) => handleInputChange("imageUrl", e.target.value)} placeholder="https://…" />
      <div className="mt-3 border-b border-line pb-2 lg:mt-2 lg:pb-[6px]"><span className="t-label">VALORI PER 100 G</span></div>
      <div className="grid grid-cols-2 gap-4 lg:-mt-[6px]">
        {num("calories", "CALORIE", "KCAL")}
        {num("proteins", "PROTEINE", "G")}
        {num("carbohydrates", "CARBOIDRATI", "G")}
        {num("fats", "GRASSI", "G")}
      </div>
    </div>
  );

  const preview = (
    <>
      <span className="t-label text-ink2">ANTEPRIMA · 100 G</span>
      <div className="mt-[14px] flex items-end gap-[10px] lg:mt-[18px]">
        <RDot text={fmt(Math.round(calories))} p={[8, 9]} />
        <span className="t-label pb-[2px] text-ink2">KCAL</span>
      </div>
      <div className="mt-[30px] flex flex-col gap-[14px] lg:mt-[38px] lg:gap-[22px]">
        {macros.map((m) => (
          <div key={m.k} className="flex items-center lg:block">
            <span className="t-label w-[68px] text-ink2 lg:hidden">{m.k}</span>
            <div className="hidden justify-between lg:flex"><span className="t-label text-ink2">{m.k}</span><span className="t-data">{fmt(m.g, 1)} G</span></div>
            <DotBar n={dots} on={Math.round((m.p / 100) * dots)} size={desktop ? 8 : 6.5} gap={desktop ? 5.6 : 3.5} className="lg:mt-2" />
            <span className="t-label ml-auto text-ink2 lg:hidden">{m.p}%</span>
            <span className="t-data w-[64px] text-right lg:hidden">{fmt(m.g, 1)} G</span>
          </div>
        ))}
      </div>
    </>
  );

  const note = <p className="t-body-s text-ink2">Dopo averlo creato lo trovi nella ricerca e puoi aggiungerlo al diario.</p>;
  const submit = (
    <Btn onClick={handleSubmit} disabled={!validationState.isValid || isSubmitting} className="flex-1 lg:w-[200px] lg:flex-none">
      {isSubmitting ? "Creando..." : "Crea alimento"}
    </Btn>
  );

  if (desktop) {
    return (
      <Modal onClose={onClose} width={880}>
        <div className="flex items-start justify-between px-2">
          <div>
            <h2 className="t-title">Crea alimento</h2>
            <p className="t-body-s mt-1 text-ink2">Usa i valori dell’etichetta, riferiti a 100 g.</p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="mt-[26px] flex gap-8 px-2">
          <div className="w-[440px]">{fields}</div>
          <div className="flex flex-1 flex-col rounded-3xl bg-control px-6 pb-6 pt-6">
            {preview}
            <div className="mt-10">{note}</div>
          </div>
        </div>
        <div className="mt-14 flex justify-end gap-4 px-2">
          <Btn kind="secondary" className="w-[160px]" onClick={onClose}>Annulla</Btn>
          {submit}
        </div>
      </Modal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-void">
      <div className="px-5 pb-[140px] pt-[15px]">
        <div className="flex items-center justify-between">
          <button onClick={onClose} aria-label="Chiudi" className="cursor-pointer"><X size={22} strokeWidth={1.5} /></button>
          <span className="t-label text-ink2">PERSONALIZZATO</span>
        </div>
        <div className="mt-6"><Dot text="crea" p={5} /></div>
        <p className="t-body mb-[22px] mt-[14px] text-ink2">Usa i valori dell’etichetta, riferiti a 100 g.</p>
        {fields}
        <section className="mt-[34px] rounded-[28px] bg-tile px-5 pb-[22px] pt-5">{preview}</section>
        <div className="mt-4">{note}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 flex gap-4 border-t border-line bg-void px-5 pb-[42px] pt-[18px]">
        <Btn kind="secondary" className="flex-1" onClick={onClose}>Annulla</Btn>
        {submit}
      </div>
    </div>
  );
};

export default CustomFoodForm;

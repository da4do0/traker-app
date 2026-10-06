import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ScanBarcode, Search, WifiOff, X } from "lucide-react";
import { APIDbHandler } from "../api/APIHandler";
import type {
  FoodDetailProps,
  FoodDetailBarcode,
} from "../types/Food";
import FoodDetail from "../components/FoodDetail";
import FoodForm from "../components/FoodForm";
import BarcodeFinder from "../components/BarcodeFinder";
import CustomFoodForm from "../components/CustomFoodForm";
import { FoodPanel } from "../components/FoodPanel";
import Shell from "../components/Shell";
import { Btn, DAYS, Dot, IconBtn, ddmm, useIsDesktop } from "../components/ui";

const Food: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [queryFood, setQueryFood] = useState<FoodDetailProps[]>([]);
  const [foodDetailHover, setFoodDetailHover] = useState(null);
  // "Scansiona" dalla Home apre direttamente lo scanner
  const [cameraActive, setCameraActive] = useState<boolean>(!!useLocation().state?.scan);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [netError, setNetError] = useState(false);
  const [selected, setSelected] = useState(0);
  const desktop = useIsDesktop();
  const navigate = useNavigate();

  const searchFoodQuery = async (query: string) => {
    try {
      const response = await APIDbHandler.SearchFoodQuery(query);

      const formatted = response?.products.map((p: FoodDetailProps) => ({
        code: p?.code,
        name: p?.name || "Nome non disponibile",
        brands: p?.brands || "Marca non specificata",
        quantity: p?.quantity || "Quantità non specificata",
        categories: p?.categories || "Sconosciuto",
        imageUrl: p?.imageUrl || "https://via.placeholder.com/150",
        nutritionGrade: p?.nutritionGrade || "N/A",
        novaGroup: p?.novaGroup || 0,
        servingSize: p?.servingSize || "Porzione non specificata",
        nutrition: {
          calories100g: p?.nutrition?.calories100g ?? 0,
          protein100g: p?.nutrition?.protein100g ?? 0,
          carbs100g: p?.nutrition?.carbs100g ?? 0,
          fat100g: p?.nutrition?.fat100g ?? 0,
        },
        ingredients: p.ingredients || "Ingredienti non specificati",
        allergens: p.allergens || [],
        handleFoodHover: handleFoodHover,
      }));

      setQueryFood(formatted);
      setNetError(false);
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
      setNetError(true);
    }
  };

  const searchFoodBarcode = async (barcode: string) => {
    try {
      // Padding del barcode a 13 cifre se necessario
      const paddedBarcode = barcode.padStart(13, "0");
      const response: FoodDetailBarcode = await APIDbHandler.SearchFoodBarcode(
        paddedBarcode
      );

      if (response?.found && response?.product) {
        const p = response.product;
        const formatted = {
          code: p.code,
          name: p.name || "Nome non disponibile",
          brands: p.brands || "Marca non specificata",
          quantity: p.quantity || "Quantità non specificata",
          categories: p.categories || "Sconosciuto",
          imageUrl: p.imageUrl || "https://via.placeholder.com/150",
          nutritionGrade: p.nutritionGrade || "N/A",
          novaGroup: p.novaGroup || 0,
          servingSize: p.servingSize || "Porzione non specificata",
          nutrition: {
            calories100g: p.nutrition?.calories100g ?? 0,
            protein100g: p.nutrition?.protein100g ?? 0,
            carbs100g: p.nutrition?.carbs100g ?? 0,
            fat100g: p.nutrition?.fat100g ?? 0,
          },
          ingredients: p.ingredients || "Ingredienti non specificati",
          allergens: p.allergens || [],
          handleFoodHover: handleFoodHover,
        };

        setQueryFood([formatted]);
      } else {
        setQueryFood([]);
      }
      setNetError(false);
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
      setQueryFood([]);
      // prodotto non trovato = 404 (nessun risultato); server irraggiungibile o in errore = errore di rete
      setNetError(error instanceof TypeError || (error as Error)?.message === "Internal server error");
    }
  };

  const handleFoodHover = (food: any) => {
    setFoodDetailHover(food);
  };

  const search = (q: string) => (/^[^\d]+$/.test(q) ? searchFoodQuery(q) : searchFoodBarcode(q));

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === "Enter" && searchQuery.trim() !== "") {
        event.preventDefault();
        await search(searchQuery);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery]);

  useEffect(() => setSelected(0), [queryFood]);

  // ---------- UI
  const d = new Date();
  const current = queryFood[selected];
  const createBtn = (cls: string) => (
    <Btn kind="secondary" icon={<Plus size={20} strokeWidth={1.5} />} onClick={() => setShowCustomForm(true)} className={`!h-12 w-full ${cls}`}>
      Crea alimento
    </Btn>
  );

  const left = (
    <>
      <div className="flex gap-2 lg:gap-3">
        <label className="flex h-[52px] min-w-0 flex-1 cursor-text items-center gap-[10px] rounded-full bg-control pl-[18px] pr-3 lg:h-14 lg:gap-3 lg:pl-5 lg:pr-[22px]">
          <Search size={20} strokeWidth={1.5} className="shrink-0 text-ink2" />
          <input
            className="t-body min-w-0 flex-1 bg-transparent text-ink caret-ink outline-none"
            type="text"
            enterKeyHint="search"
            placeholder="Cerca tra migliaia di alimenti"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} aria-label="Svuota la ricerca" className="cursor-pointer text-ink2 hover:text-ink">
              <X size={18} strokeWidth={1.5} />
            </button>
          )}
        </label>
        <IconBtn size={52} className="lg:!h-14" aria-label="Scansiona un codice a barre" onClick={() => setCameraActive(true)}>
          <ScanBarcode size={22} strokeWidth={1.75} />
        </IconBtn>
      </div>

      {netError ? (
        <>
          <section className="mt-[38px] rounded-[28px] bg-tile px-5 pb-[22px] pt-6 lg:mt-8 lg:rounded-[32px] lg:px-7 lg:pb-[30px] lg:pt-7">
            <span className="flex size-12 items-center justify-center rounded-full bg-control"><WifiOff size={22} strokeWidth={1.6} /></span>
            <h2 className="t-title mt-6">Ricerca non disponibile</h2>
            <p className="t-body mt-2 text-ink2">Non riesco a contattare il server degli alimenti. Controlla la connessione e riprova tra poco.</p>
            <p className="t-label-s mt-4 text-ink2 lg:mt-[38px]">ERRORE DI RETE · OPENFOODFACTS</p>
            <Btn onClick={() => search(searchQuery)} className="mt-[10px] !h-11 w-[150px] lg:mt-[14px] lg:!h-12">Riprova</Btn>
          </section>
          <p className="t-body-s mt-7 text-ink2">Puoi comunque creare un alimento personalizzato.</p>
          {createBtn("mt-[14px] lg:w-[220px]")}
        </>
      ) : (
        <>
          <p className="t-body-s mt-[10px] text-ink2 lg:mt-3">Scrivi un nome, oppure un codice a barre (solo numeri).</p>
          {queryFood.length > 0 && (
            <>
              <div className="mt-7 flex justify-between lg:mt-[22px]">
                <span className="t-label">{queryFood.length} {queryFood.length === 1 ? "RISULTATO" : "RISULTATI"}</span>
                <span className="t-label text-ink2">OPENFOODFACTS</span>
              </div>
              <div className="mt-[15px] lg:mt-[11px]">
                {queryFood.map((food: FoodDetailProps, i) => (
                  <React.Fragment key={food.code}>
                    {i > 0 && <div className={`h-px bg-line ${desktop && (i === selected || i - 1 === selected) ? "invisible" : ""}`} />}
                    <FoodDetail {...food} index={i + 1} total={queryFood.length}
                      selected={desktop && i === selected} onSelect={desktop ? () => setSelected(i) : undefined} />
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
          <section className={`${queryFood.length ? "mt-[14px] lg:mt-8" : "mt-7 lg:mt-8"} rounded-[28px] bg-tile px-5 pb-[22px] pt-[22px] lg:rounded-[32px] lg:px-7 lg:pb-8 lg:pt-[26px]`}>
            <h2 className="t-title">Non lo trovi?</h2>
            <p className="t-body-s mt-[6px] text-ink2">Crea un alimento con i valori dell’etichetta: calorie e macro per 100 g.</p>
            {createBtn("mt-[10px] lg:w-[200px]")}
          </section>
        </>
      )}
    </>
  );

  const overlays = (
    <>
      {foodDetailHover && <FoodForm food={foodDetailHover} back={handleFoodHover} />}

      {cameraActive && (
        <BarcodeFinder
          onClose={() => setCameraActive(false)}
          onCodeFound={async (code) => {
            // lo scanner resta aperto («Cerco il prodotto…») finché la ricerca non risponde
            await searchFoodBarcode(code);
            setSearchQuery(code);
            setCameraActive(false);
          }}
        />
      )}

      {showCustomForm && (
        <CustomFoodForm
          onClose={() => setShowCustomForm(false)}
          onFoodCreated={(food) => {
            console.log("Custom food created:", food);
          }}
        />
      )}
    </>
  );

  if (desktop) {
    return (
      <Shell>
        <header className="mb-[30px] flex items-start justify-between">
          <Dot text="cerca" p={8} />
          <span className="t-label mt-7 text-ink2">AGGIUNGI A OGGI · {DAYS[d.getDay()]} {ddmm(d)}</span>
        </header>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5">{left}</div>
          <div className="sticky top-8 col-span-7 self-start">
            {current && !netError ? (
              <FoodPanel food={current} onAdd={() => handleFoodHover(current)} />
            ) : (
              <div className="relative flex h-[848px] items-center justify-center">
                <svg className="absolute inset-0 size-full" aria-hidden>
                  <rect x=".5" y=".5" rx="31.5" style={{ width: "calc(100% - 1px)", height: "calc(100% - 1px)" }} fill="none" className="stroke-line" strokeDasharray="6 6" />
                </svg>
                <p className="t-body text-ink2">Il dettaglio del prodotto comparirà qui</p>
              </div>
            )}
          </div>
        </div>
        {overlays}
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-void px-5 pb-12 pt-[15px] text-ink">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} aria-label="Indietro" className="cursor-pointer"><ArrowLeft size={22} strokeWidth={1.5} /></button>
        <span className="t-label text-ink2">AGGIUNGI A OGGI</span>
      </div>
      <div className="mb-[18px] mt-6"><Dot text="cerca" p={5} /></div>
      {left}
      {overlays}
    </div>
  );
};

export default Food;

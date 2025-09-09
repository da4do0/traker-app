import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Container from "../components/container";
import ButtonContainer from "../components/ButtonContainer";
import { Search, Zap, Clock, ChefHat, Plus, Camera } from "lucide-react";
import FoodCard from "../components/FoodCard";
import { APIDbHandler } from "../api/APIHandler";
import type {
  FoodDetailProps,
  FoodDetailHover,
  FoodDetailBarcode,
} from "../types/Food";
import FoodDetail from "../components/FoodDetail";
import FoodForm from "../components/FoodForm";
import BarcodeFinder from "../components/BarcodeFinder";
import CustomFoodForm from "../components/CustomFoodForm";

const Food: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [queryFood, setQueryFood] = useState<FoodDetailProps[]>([]);
  const [foodForm, setFoodForm] = useState<boolean>(false);
  const [foodDetailHover, setFoodDetailHover] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

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
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
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
        console.log("Prodotto non trovato");
        setQueryFood([]);
      }
    } catch (error) {
      console.error("Errore durante la ricerca:", error);
      setQueryFood([]);
    }
  };

  const handleFoodHover = (food: any) => {
    console.log("Food hovered:", food);
    setFoodDetailHover(food);
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === "Enter" && searchQuery.trim() !== "") {
        event.preventDefault();
        if (/^[^\d]+$/.test(searchQuery)) await searchFoodQuery(searchQuery);
        else await searchFoodBarcode(searchQuery);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-2 md:p-6">
      <Header />
      <main className="flex items-start  justify-center gap-2">
        <div className="flex flex-col w-[60%] gap-2">
          {/* search container */}
          <Container>
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex items-center gap-2">
                <div className="bg-green-900/50 rounded-lg w-fit p-2">
                  <Search color="green" />
                </div>
                <span className="text-white">Cerca Alimento</span>
              </div>

              <div className="flex items-center gap-1 bg-gray-600/50 px-2 py-1 w-fit rounded-4xl">
                <Zap color="white" size={10} />
                <span className="text-white text-[10px]">Ricerca Rapida</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-gray-700 rounded-lg p-2 bg-gray-800">
              <Search color="gray" />
              <input
                className="text-slate-200 text-[18px] w-full focus:outline-none"
                type="text"
                placeholder="Cerca tra migliaia di alimenti"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Camera
                color="gray"
                onClick={() => {
                  setCameraActive(true);
                }}
                className="cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
              {queryFood.map((food: FoodDetailProps) => (
                <FoodDetail key={food.code} {...food} />
              ))}
            </div>
          </Container>

          {/* recent food container */}
          {/* <Container>
            <div className="flex items-center justify-between gap-2 ">
              <div className="flex items-center gap-2">
                <div className="bg-blue-900/50 rounded-lg w-fit p-2">
                  <Clock color="blue" />
                </div>
                <span className="text-white">Alimenti recenti</span>
              </div>

              <div className="flex items-center gap-1 bg-gray-600/50 px-2 py-1 w-fit rounded-4xl">
                <span className="text-white text-[10px]">Accesso Rapido</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <span className=" text-white">In arrivo</span>

               <FoodCard
                name="Petto di Pollo"
                type="Proteine"
                typeColor="red"
                kcal={165}
                protein={31}
                carbs={0}
                fat={3.6}
              />
              <FoodCard
                name="Riso Basmati"
                type="Carboidrati"
                typeColor="yellow"
                kcal={130}
                protein={2.7}
                carbs={28}
                fat={0.3}
              />
              <FoodCard
                name="Broccoli"
                type="Verdure"
                typeColor="green"
                kcal={34}
                protein={2.8}
                carbs={7}
                fat={0.4}
              />
              <FoodCard
                name="Olio EVO"
                type="Grassi"
                typeColor="purple"
                kcal={884}
                protein={0}
                carbs={0}
                fat={100}
              />
              <FoodCard
                name="Banana"
                type="Frutta"
                typeColor="orange"
                kcal={89}
                protein={1.1}
                carbs={23}
                fat={0.3}
              />
              <FoodCard
                name="Yogurt Greco"
                type="Latticini"
                typeColor="blue"
                kcal={59}
                protein={10}
                carbs={3.6}
                fat={0.4}
              /> 
            </div>
          </Container> */}
        </div>

        {/* create food container */}
        <Container css="max-w-[350px]">
          <div className="flex items-center gap-2">
            <div className="bg-orange-900/50 rounded-lg w-fit p-2">
              <ChefHat color="orange" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white">Crea personalizzato</span>
              <span className="text-white/70 text-[10px]">Ricerca Rapida</span>
            </div>
          </div>
          <span className="text-white/70 font-light">
            Non trovi l'alimento che cerchi? Creane uno personalizzato con i
            valori nutrizionali specifici.
          </span>
          <button
            onClick={() => setShowCustomForm(true)}
            className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 gap-1 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus color="white" />
            <span className="text-white font-medium">Crea Nuovo Alimento</span>
          </button>
          <ButtonContainer color="gray" link="">
            <span className="text-white">Suggerimento</span>
            <span className="text-white/70 text-[10px]">
              Puoi trovare i valori nutrizionali sull'etichetta del prodotto o
              su siti come USDA Food Database.
            </span>
          </ButtonContainer>
        </Container>
      </main>
      {foodDetailHover && (
        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center z-50 backdrop-blur-xs">
          <FoodForm food={foodDetailHover} back={handleFoodHover} />
        </div>
      )}

      {cameraActive && (
        <BarcodeFinder
          onClose={() => setCameraActive(false)}
          onCodeFound={(code) => {
            setSearchQuery(code);
            searchFoodBarcode(code);
            setCameraActive(false);
          }}
        />
      )}

      {showCustomForm && (
        <CustomFoodForm
          onClose={() => setShowCustomForm(false)}
          onFoodCreated={(food) => {
            console.log("Custom food created:", food);
            // Optionally refresh the food list or show success message
          }}
        />
      )}
    </div>
  );
};

export default Food;

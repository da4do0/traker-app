import React from "react";
import Header from "../components/Header";
import Container from "../components/container";
import ButtonContainer from "../components/ButtonContainer";
import { Search, Zap, Clock, ChefHat, Plus } from "lucide-react";
import FoodCard from "../components/FoodCard";

const Food: React.FC = () => {
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
                className="text-slate-200 text-[18px] "
                type="text"
                placeholder="Cerca tra migliaia di alimenti"
              />
            </div>
          </Container>

          {/* recent food container */}
          <Container>
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
              <FoodCard name="Petto di Pollo" type="Proteine" typeColor="red" kcal={165} protein={31} carbs={0} fat={3.6} />
              <FoodCard name="Riso Basmati" type="Carboidrati" typeColor="yellow" kcal={130} protein={2.7} carbs={28} fat={0.3} />
              <FoodCard name="Broccoli" type="Verdure" typeColor="green" kcal={34} protein={2.8} carbs={7} fat={0.4} />
              <FoodCard name="Olio EVO" type="Grassi" typeColor="purple" kcal={884} protein={0} carbs={0} fat={100} />
              <FoodCard name="Banana" type="Frutta" typeColor="orange" kcal={89} protein={1.1} carbs={23} fat={0.3} />
              <FoodCard name="Yogurt Greco" type="Latticini" typeColor="blue" kcal={59} protein={10} carbs={3.6} fat={0.4} />
            </div>
          </Container>
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
          <div className="flex items-center justify-center bg-orange-500 gap-1 py-2 rounded-lg">
            <Plus color="white" />
            <span className="text-white font-medium">Crea Nuovo Alimento</span>
          </div>
          <ButtonContainer color="gray" link="">
            <span className="text-white">Suggerimento</span>
            <span className="text-white/70 text-[10px]">
              Puoi trovare i valori nutrizionali sull'etichetta del prodotto o
              su siti come USDA Food Database.
            </span>
          </ButtonContainer>
        </Container>
      </main>
    </div>
  );
};

export default Food;

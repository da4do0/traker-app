import React from "react";
import Header from "../components/Header";
import Container from "../components/container";
import ButtonContainer from "../components/ButtonContainer";
import { Search, Zap } from "lucide-react";

const Food: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-2 md:p-6">
      <Header />
      <main className="">
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
      </main>
    </div>
  );
};

export default Food;

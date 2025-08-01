import React, { useEffect } from "react";
import { UserCircle, Plus, Droplet, CupSoda, Scale, BarChart2, Utensils } from "lucide-react";
import { Route } from "react-router-dom";
import Container from "../components/container";
import ButtonContainer from "../components/ButtonContainer";
import Header from "../components/Header";
import { useUser } from "../hooks/UserInfo";
import { APIDbHandler } from "../api/APIHandler";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {

  const {username, setUsername} = useUser();
  const navigate = useNavigate();

  const checkLocalUsername = () => {
    const storedUsername = localStorage.getItem("username");
    return storedUsername ? true : false;
  }

  const getIfnoUser = async (username: string) => {
    try {
      const response = await APIDbHandler.InfoUser(username);
      console.log(response, "User Info");
    }
    catch (error) {
      console.error("Errore durante il recupero delle informazioni utente:", error);
    }
  }

  useEffect(() => {
    if (!username && !checkLocalUsername()) {
      navigate("/login");
    }else if (username) {
      localStorage.setItem("username", username);
    }else{
      const storedUsername = localStorage.getItem("username");
      setUsername(storedUsername || "");
    }
    
    getIfnoUser(username);
  },[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-2 md:p-6">
      {/* Header */}
      
      <Header />

      {/* Azioni rapide */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
        <ButtonContainer color="emerald" link="food">
          <Plus className="text-emerald-400 mb-1" />
          <span className="text-emerald-200 text-sm">Alimento</span>
        </ButtonContainer>

        <ButtonContainer color="yellow" link="">
        <CupSoda className="text-yellow-300 mb-1" />
          <span className="text-yellow-200 text-sm">Bevanda</span>
        </ButtonContainer>

        <ButtonContainer color="blue" link="">
          <Droplet className="text-blue-300 mb-1" />
          <span className="text-blue-200 text-sm">Acqua</span>
        </ButtonContainer>

        <ButtonContainer color="purple" link="">
          <Scale className="text-purple-300 mb-1" />
          <span className="text-purple-200 text-sm">Peso</span>
        </ButtonContainer>

      </section>

      {/* Cards principali */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Nutrizione */}
        <Container>
          <div className="flex items-center gap-2 text-green-400 font-semibold text-lg">
            <Utensils className="w-5 h-5" />
            Nutrizione Oggi
            <span className="ml-auto text-xs text-gray-400 font-normal">0%</span>
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>di 2456 kcal</span>
          </div>
          <div className="flex flex-col items-center mt-2">
            <span className="text-gray-400 text-sm mb-2">Nessun alimento registrato oggi</span>
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Aggiungi il primo alimento
            </button>
          </div>
        </Container>
        
        {/* Idratazione */}
        <Container>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-lg">
            <Droplet className="w-5 h-5" />
            Idratazione Totale
            <span className="ml-auto text-xs text-gray-400 font-normal">0%</span>
          </div>
          <div className="text-3xl font-bold text-white">0ml</div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <div className="text-xs text-gray-400 flex justify-between">
            <span>di 2555ml</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
              <Droplet className="w-4 h-4" /> Acqua
            </button>
            <button className="bg-yellow-100/10 border border-yellow-400/20 hover:bg-yellow-200/20 text-yellow-200 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
              <CupSoda className="w-4 h-4" /> Bevanda
            </button>
          </div>
        </Container>

        {/* Peso */}
        <Container>
          <div className="flex items-center gap-2 text-purple-300 font-semibold text-lg">
            <Scale className="w-5 h-5" />
            Peso & Andamento
          </div>
          <div className="text-3xl font-bold text-white">73.0kg</div>
          <div className="text-xs text-gray-400">Peso attuale</div>
          <div className="flex items-center gap-2 mt-2">
            <button className="bg-gray-800 border border-gray-700 hover:bg-purple-900 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
              <Scale className="w-4 h-4" /> Aggiorna peso
            </button>
            <span className="text-xs text-gray-500">0.0kg questa settimana</span>
          </div>
        </Container>

        {/* Metabolismo */}
        <Container>
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-lg">
            <BarChart2 className="w-5 h-5" />
            Metabolismo
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm text-gray-300">
              <span>TDEE (Fabbisogno totale)</span>
              <span className="font-bold text-white">2456 kcal</span>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span>BMR (Metabolismo basale)</span>
              <span className="font-bold text-white">1786 kcal</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Il TDEE è il tuo fabbisogno calorico giornaliero totale, calcolato in base al tuo metabolismo basale e livello di attività.
          </div>
        </Container>
      </section>

      {/* Footer mobile (placeholder) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 flex justify-around items-center py-2 md:hidden z-20">
        <button className="flex flex-col items-center text-emerald-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" /></svg>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
          <span className="text-xs">Diario</span>
        </button>
        <button className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-full w-12 h-12 shadow-lg -mt-8 border-4 border-gray-950">
          <Plus className="w-7 h-7" />
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs">Statistiche</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <UserCircle className="w-6 h-6" />
          <span className="text-xs">Profilo</span>
        </button>
      </footer>
    </div>
  );
};

export default Home; 
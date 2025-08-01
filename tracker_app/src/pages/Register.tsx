import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Utensils,
  AlertCircle,
  User as LucideUser,
  Mail,
  Lock,
  Ruler,
  Weight
} from "lucide-react";
import DateInput from "../components/DateInput";
import Input from "../components/input";
import type { User, Sex } from "../interfaces/User";
import { APIDbHandler } from "../api/APIHandler";
import RadioGroup from "../components/RadioGroup";
import { useUser } from "../hooks/UserInfo";

//todo: Sistemare la grafica degl'input

const Register: React.FC = () => {
  const [username, setusername] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [surname, setSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [sex, setSex] = useState<Sex>("Male");
  const [birthDay, setBirthDay] = useState<string>("");
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);

  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { setUsername } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if(!sex || !birthDay || !height || !weight) {
      setError("Tutti i campi sono obbligatori.");
      return;
    }
    
    const response = await APIDbHandler.newUser({
      username: username,
      nome: name,
      cognome: surname,
      email,
      password,
      sex: sex,
      dateofBirth: birthDay,
      weight,
      height
    });

    if (response) {
      setError("");
      console.log(response, "Nuovo utente creato");
      setUsername(username);
      localStorage.setItem("username", username);
      // Login automatico dopo la registrazione
      try {
        navigate("/");
      } catch (err) {
        setError("Errore durante il login dopo la registrazione.");
        console.error(err);
      }
    } else {
      setError("Errore durante la registrazione. Riprova.");
    }
  };

  const checkDataUser = async () => {
    if (!username || !name || !surname || !email || !password) {
      setError("Tutti i campi sono obbligatori.");
      return false;
    }

    const response = await APIDbHandler.checkUser(username);
    if (response) {
      setError("Username già esistente. Scegline un altro.");
      return false;
    }else {
      console.log(response, "Esiste utente");
      setIsNew(true);
    }

  };

  return (
    <div className=" overflow-hidden min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-950 flex items-center justify-center p-4">
      <div className="w-full ">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mb-4 shadow-lg shadow-blue-500/25">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FoodTracker</h1>
          <p className="text-gray-300">
            Traccia la tua alimentazione quotidiana
          </p>
        </div>

        <div
          className={`w-[200vw] flex transition-transform duration-500 ease-in-out ${
            isNew ? "-translate-x-[100vw]" : "translate-x-0"
          }`}
        >
          <div className="w-[100vw] flex items-center justify-center">
            {/* Card principale */}
            <div className=" max-w-[600px] w-[50%] bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Bentornato!
                </h2>
                <p className="text-gray-300">
                  Inserisci le tue credenziali per continuare
                </p>
              </div>

              {/* Messaggio di errore */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    label="Name"
                    value={name}
                    onChange={setName}
                    placeHolder="Mario"
                  >
                    <LucideUser className="h-5 w-5 text-gray-400" />
                  </Input>
                  {/* Campo surname */}
                  <Input
                    label="Surname"
                    value={surname}
                    onChange={setSurname}
                    placeHolder="Rossi"
                  >
                    <LucideUser className="h-5 w-5 text-gray-400" />
                  </Input>
                </div>
                {/* Campo email */}
                <Input
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeHolder="Mario.rossi@email.com"
                >
                  <Mail className="h-5 w-5 text-gray-400" />
                </Input>

                {/* Campo username */}
                <Input
                  label="Username"
                  value={username}
                  onChange={setusername}
                  placeHolder="Mario.rossi"
                >
                  <LucideUser className="h-5 w-5 text-gray-400" />
                </Input>
                {/* Campo Password */}
                <Input
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  placeHolder="password"
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </Input>
                {/* Bottone di accesso */}
                <button
                  type="submit"
                  onClick={checkDataUser}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 mt-3"
                >
                  Avanti!
                </button>
              </form>
            </div>
          </div>

          <div className="w-[100vw] flex items-center justify-center">
            {/* Card principale */}
            <div className=" max-w-[600px] w-[50%] bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Bentornato!
                </h2>
                <p className="text-gray-300">
                  Inserisci le tue credenziali per continuare
                </p>
              </div>

              {/* Messaggio di errore */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <RadioGroup
                  label="Sesso"
                  value={sex}
                  onChange={(value) => setSex(value as Sex)}
                />
                <DateInput
                  label="Compleanno"
                  onChange={setBirthDay}
                  value={birthDay}
                />
                <Input
                  label="Altezza (cm)"
                  value={height.toString()}
                  type="number"
                  onChange={(val) => setHeight(Number(val))}
                  placeHolder="180"
                >
                  <Ruler className="h-5 w-5 text-gray-400" />
                </Input>

                <Input
                  label="Peso (Kg)"
                  value={weight.toString()}
                  type="number"
                  onChange={(val) => setWeight(Number(val))}
                  placeHolder="180"
                >
                  <Weight className="h-5 w-5 text-gray-400" />
                </Input>
                {/* Bottone di accesso */}
                <div className="w-full flex items-center justify-center gap-4">
                  <button
                    className="flex-1 bg-gray-700/80 text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-md shadow-gray-900/20"
                    type="button"
                    onClick={() => setIsNew(false)}
                  >
                    Indietro
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => handleSubmit(e)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Registrati ora!
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Hai già un account?{" "}
            <a
              href="#"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Accedi qui
            </a>
          </p>
        </div>
      </div>

      {/* Elementi decorativi di sfondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-800/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Register;

import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Utensils,
  AlertCircle,
  User as LucideUser,
  Mail,
  Lock,
  Ruler,
  Weight,
  Activity,
  Target,
  Calculator
} from "lucide-react";
import DateInput from "../components/DateInput";
import Input from "../components/input";
import type { Sex, ActivityLevel, WeightGoal } from "../interfaces/User";
import { ActivityLevel as ActivityLevelEnum, WeightGoal as WeightGoalEnum } from "../interfaces/User";
import { APIDbHandler } from "../api/APIHandler";
import RadioGroup from "../components/RadioGroup";
import FlexibleRadioGroup from "../components/FlexibleRadioGroup";
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
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevelEnum.Sedentary);
  const [weightGoal, setWeightGoal] = useState<WeightGoal>(WeightGoalEnum.MaintainWeight);
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [estimatedCalories, setEstimatedCalories] = useState<number>(0);

  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUsername } = useUser();

  // Activity level options with multipliers
  const activityOptions = [
    {
      value: ActivityLevelEnum.Sedentary,
      label: "Sedentario (1.2x)",
      description: "Poco o nessun esercizio, lavoro da scrivania"
    },
    {
      value: ActivityLevelEnum.LightlyActive,
      label: "Leggermente attivo (1.375x)",
      description: "Esercizio leggero 1-3 giorni/settimana"
    },
    {
      value: ActivityLevelEnum.ModeratelyActive,
      label: "Moderatamente attivo (1.55x)",
      description: "Esercizio moderato 3-5 giorni/settimana"
    },
    {
      value: ActivityLevelEnum.VeryActive,
      label: "Molto attivo (1.725x)",
      description: "Esercizio intenso 6-7 giorni/settimana"
    },
    {
      value: ActivityLevelEnum.ExtremelyActive,
      label: "Estremamente attivo (1.9x)",
      description: "Esercizio molto intenso, lavoro fisico"
    }
  ];

  // Weight goal options
  const weightGoalOptions = [
    {
      value: WeightGoalEnum.LoseWeight,
      label: "Perdere peso",
      description: "Deficit calorico per perdita di peso"
    },
    {
      value: WeightGoalEnum.MaintainWeight,
      label: "Mantenere peso",
      description: "Mantenere il peso attuale"
    },
    {
      value: WeightGoalEnum.GainWeight,
      label: "Aumentare peso",
      description: "Surplus calorico per aumento massa"
    }
  ];

  // Calculate age from birth date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get activity multiplier
  const getActivityMultiplier = (level: ActivityLevel): number => {
    switch (level) {
      case ActivityLevelEnum.Sedentary: return 1.2;
      case ActivityLevelEnum.LightlyActive: return 1.375;
      case ActivityLevelEnum.ModeratelyActive: return 1.55;
      case ActivityLevelEnum.VeryActive: return 1.725;
      case ActivityLevelEnum.ExtremelyActive: return 1.9;
      default: return 1.2;
    }
  };

  // Calculate BMR and daily calories
  const calculateCalories = (): number => {
    if (!weight || !height || !birthDay) return 0;

    const age = calculateAge(birthDay);
    let bmr: number;

    // Mifflin-St Jeor Equation
    if (sex === "Male") {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Apply activity multiplier
    const tdee = bmr * getActivityMultiplier(activityLevel);

    // Apply goal adjustment
    let goalAdjustment = 0;
    if (weightGoal === WeightGoalEnum.LoseWeight) {
      goalAdjustment = -500; // 500 calorie deficit
    } else if (weightGoal === WeightGoalEnum.GainWeight) {
      goalAdjustment = 400; // 400 calorie surplus
    }

    return Math.round(tdee + goalAdjustment);
  };

  // Update calories when relevant values change
  useEffect(() => {
    const calories = calculateCalories();
    setEstimatedCalories(calories);
  }, [weight, height, birthDay, sex, activityLevel, weightGoal]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if(!sex || !birthDay || !height || !weight || !activityLevel || !weightGoal) {
      setError("Tutti i campi sono obbligatori.");
      return;
    }
    
    // Validate target weight if goal is to lose or gain weight
    if ((weightGoal === WeightGoalEnum.LoseWeight || weightGoal === WeightGoalEnum.GainWeight) && (!targetWeight || targetWeight <= 0)) {
      setError("Inserisci un peso target valido per il tuo obiettivo.");
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
      height,
      activityLevel,
      weightGoal,
      targetWeight: (weightGoal === WeightGoalEnum.MaintainWeight) ? weight : targetWeight,
      dailyCalorieGoal: estimatedCalories
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
      setCurrentScreen(1);
    }
  };

  const handleNextScreen = () => {
    if (currentScreen === 1) {
      // Validate screen 2 data before proceeding
      if (!sex || !birthDay || !height || !weight) {
        setError("Tutti i campi sono obbligatori.");
        return;
      }
    }
    setError(""); // Clear any previous errors
    setCurrentScreen(prev => Math.min(prev + 1, 2));
  };

  const handlePrevScreen = () => {
    setError(""); // Clear any previous errors
    setCurrentScreen(prev => Math.max(prev - 1, 0));
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
          className={`w-[300vw] flex transition-transform duration-500 ease-in-out `}
          style={{
            transform: `translateX(-${currentScreen * 100}vw)`
          }}
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
                  type="button"
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
                  Informazioni Fisiche
                </h2>
                <p className="text-gray-300">
                  Inserisci i tuoi dati fisici per personalizzare l'esperienza
                </p>
              </div>

              {/* Messaggio di errore */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
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
                    onClick={handlePrevScreen}
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={handleNextScreen}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Avanti!
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[100vw] flex items-center justify-center">
            {/* Card principale - Screen 3 */}
            <div className="max-w-[600px] w-[50%] bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-6 max-h-[85vh] overflow-hidden">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Obiettivi e Attività
                </h2>
                <p className="text-gray-300 text-sm">
                  Personalizza i tuoi obiettivi per calcolare le calorie giornaliere
                </p>
              </div>

              {/* Messaggio di errore */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              )}

              <div className="space-y-4 overflow-y-auto max-h-[55vh]">
                {/* Activity Level Slider */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-200">
                      Livello di Attività
                    </label>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={Object.values(ActivityLevelEnum).indexOf(activityLevel)}
                      onChange={(e) => {
                        const index = parseInt(e.target.value);
                        setActivityLevel(Object.values(ActivityLevelEnum)[index]);
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-white text-sm font-medium mb-1">
                        {activityOptions[Object.values(ActivityLevelEnum).indexOf(activityLevel)]?.label}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {activityOptions[Object.values(ActivityLevelEnum).indexOf(activityLevel)]?.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Goal Slider */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <label className="text-sm font-medium text-gray-200">
                      Obiettivo di Peso
                    </label>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      value={Object.values(WeightGoalEnum).indexOf(weightGoal)}
                      onChange={(e) => {
                        const index = parseInt(e.target.value);
                        setWeightGoal(Object.values(WeightGoalEnum)[index]);
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="text-white text-sm font-medium mb-1">
                        {weightGoalOptions[Object.values(WeightGoalEnum).indexOf(weightGoal)]?.label}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {weightGoalOptions[Object.values(WeightGoalEnum).indexOf(weightGoal)]?.description}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Weight Input - Only show for lose/gain weight goals */}
                {(weightGoal === WeightGoalEnum.LoseWeight || weightGoal === WeightGoalEnum.GainWeight) && (
                  <Input
                    label={`Peso Target (Kg) - ${weightGoal === WeightGoalEnum.LoseWeight ? 'Obiettivo' : 'Desiderato'}`}
                    value={targetWeight.toString()}
                    type="number"
                    onChange={(val) => setTargetWeight(Number(val))}
                    placeHolder={weightGoal === WeightGoalEnum.LoseWeight ? "65" : "75"}
                  >
                    <Weight className="h-4 w-4 text-gray-400" />
                  </Input>
                )}

                {/* Calorie Preview Card - Compatta */}
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Calorie/giorno</span>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {estimatedCalories > 0 ? `${estimatedCalories}` : '-'}
                    </div>
                  </div>
                  {weightGoal !== WeightGoalEnum.MaintainWeight && (
                    <div className="text-xs text-gray-400 mt-1">
                      {weightGoal === WeightGoalEnum.LoseWeight ? 'Con deficit di 500 kcal' : 'Con surplus di 400 kcal'}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="w-full flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                <button
                  className="flex-1 bg-gray-700/80 text-gray-200 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-md shadow-gray-900/20 text-sm"
                  type="button"
                  onClick={handlePrevScreen}
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg shadow-green-500/25 text-sm"
                >
                  Completa Registrazione
                </button>
              </div>
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

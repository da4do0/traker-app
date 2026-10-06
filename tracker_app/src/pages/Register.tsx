import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye, EyeOff, Lock, Mail, Target, User as UserIcon } from "lucide-react";
import type { Sex, ActivityLevel, WeightGoal } from "../types/User";
import { ActivityLevel as ActivityLevelEnum, WeightGoal as WeightGoalEnum } from "../types/User";
import { APIDbHandler } from "../api/APIHandler";
import { useUser } from "../hooks/UserInfo";
import { Btn, Dot, ErrorBanner, Field, RDot, Seg, fmt } from "../components/ui";

const STEPS = [
  { title: "account", sub: "Chi sei. Ti servirà per accedere.", label: "ACCOUNT", desc: "Nome, email e credenziali." },
  { title: "corpo", sub: "Servono per calcolare il tuo metabolismo basale.", label: "CORPO", desc: "Sesso, età, altezza e peso." },
  { title: "obiettivo", sub: "Scegli il ritmo: calcoliamo la tua quota.", label: "OBIETTIVO", desc: "Attività, obiettivo, quota." },
];

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
  const [showPassword, setShowPassword] = useState(false);

  const [currentScreen, setCurrentScreen] = useState<number>(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUsername } = useUser();

  // Activity level options with multipliers
  const activityOptions = [
    { value: ActivityLevelEnum.Sedentary, label: "Sedentario", description: "Poco o nessun esercizio, lavoro da scrivania" },
    { value: ActivityLevelEnum.LightlyActive, label: "Leggermente attivo", description: "Esercizio leggero 1–3 giorni a settimana" },
    { value: ActivityLevelEnum.ModeratelyActive, label: "Moderatamente attivo", description: "Esercizio moderato 3–5 giorni a settimana" },
    { value: ActivityLevelEnum.VeryActive, label: "Molto attivo", description: "Esercizio intenso 6–7 giorni a settimana" },
    { value: ActivityLevelEnum.ExtremelyActive, label: "Estremamente attivo", description: "Esercizio molto intenso o lavoro fisico" },
  ];

  // Weight goal options
  const weightGoalOptions = [
    { value: WeightGoalEnum.LoseWeight, label: "Perdere" },
    { value: WeightGoalEnum.MaintainWeight, label: "Mantenere" },
    { value: WeightGoalEnum.GainWeight, label: "Aumentare" },
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

  // BMR, TDEE e aggiustamento: i passaggi di calculateCalories, esposti per la tile "La tua quota"
  const quotaParts = () => {
    if (!weight || !height || !birthDay) return null;

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

    return { bmr, tdee, goalAdjustment };
  };

  // Calculate BMR and daily calories
  const calculateCalories = (): number => {
    const q = quotaParts();
    return q ? Math.round(q.tdee + q.goalAdjustment) : 0;
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

  // ---------- UI
  const step = STEPS[currentScreen];
  const activityIndex = Object.values(ActivityLevelEnum).indexOf(activityLevel);
  const activity = activityOptions[activityIndex];
  const q = quotaParts();
  const age = calculateAge(birthDay);
  const half = "grid grid-cols-2 gap-4";

  const screens = [
    <>
      <div className={half}>
        <Field label="NOME" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mario" autoComplete="given-name" />
        <Field label="COGNOME" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Rossi" autoComplete="family-name" />
      </div>
      <Field label="EMAIL" icon={<Mail size={20} strokeWidth={1.5} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mario.rossi@email.com" autoComplete="email" />
      <Field label="USERNAME" icon={<UserIcon size={20} strokeWidth={1.5} />} value={username} onChange={(e) => setusername(e.target.value)} placeholder="mario.rossi" autoComplete="username" />
      <Field label="PASSWORD" icon={<Lock size={20} strokeWidth={1.5} />} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
        right={<button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Nascondi password" : "Mostra password"} className="cursor-pointer text-ink2">{showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}</button>} />
    </>,
    <>
      <div className="flex flex-col gap-2">
        <span className="t-label text-ink2">SESSO</span>
        <Seg h={52} item="t-button" value={sex} onChange={(v) => setSex(v)} options={[{ value: "Female", label: "Femmina" }, { value: "Male", label: "Maschio" }]} />
      </div>
      <Field label="DATA DI NASCITA" icon={<Calendar size={20} strokeWidth={1.5} />} type="date" value={birthDay} onChange={(e) => setBirthDay(e.target.value)}
        max={new Date().toISOString().split('T')[0]} hint={birthDay ? `${age} anni` : undefined} />
      <div className={half}>
        <Field label="ALTEZZA" unit="CM" type="number" inputMode="numeric" value={height || ""} onChange={(e) => setHeight(Number(e.target.value))} placeholder="170" />
        <Field label="PESO" unit="KG" type="number" inputMode="decimal" step="0.1" value={weight || ""} onChange={(e) => setWeight(Number(e.target.value))} placeholder="70" />
      </div>
    </>,
    <>
      <div className="flex flex-col">
        <span className="t-label text-ink2">LIVELLO DI ATTIVITÀ</span>
        <div role="radiogroup" className="mt-[18px] flex items-end gap-[10px]">
          {activityOptions.map((o, i) => (
            <button key={o.value} type="button" role="radio" aria-checked={i === activityIndex} aria-label={o.label}
              onClick={() => setActivityLevel(Object.values(ActivityLevelEnum)[i])} className="flex flex-1 cursor-pointer flex-col items-center gap-2">
              <span className={`w-full rounded-lg ${i <= activityIndex ? "bg-ink" : "bg-dotoff"}`} style={{ height: 18 + i * 7 }} />
              <span className={`t-label-s ${i === activityIndex ? "text-ink" : "text-ink2"}`}>{i + 1}</span>
            </button>
          ))}
        </div>
        <span className="t-strong mt-[14px]">{activity?.label}<span className="hidden lg:inline"> · × {fmt(getActivityMultiplier(activityLevel), 2)}</span></span>
        <span className="t-body-s mt-[2px] text-ink2"><span className="lg:hidden">× {fmt(getActivityMultiplier(activityLevel), 2)} · </span>{activity?.description}</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="t-label text-ink2">OBIETTIVO</span>
        <Seg h={52} item="t-button" value={weightGoal} onChange={(v) => setWeightGoal(v)} options={weightGoalOptions} />
      </div>
      {(weightGoal === WeightGoalEnum.LoseWeight || weightGoal === WeightGoalEnum.GainWeight) && (
        <Field label="PESO OBIETTIVO" icon={<Target size={20} strokeWidth={1.5} />} unit="KG" type="number" inputMode="decimal" step="0.1"
          value={targetWeight || ""} onChange={(e) => setTargetWeight(Number(e.target.value))} placeholder={weightGoal === WeightGoalEnum.LoseWeight ? "65" : "75"} />
      )}
      <section className="rounded-[28px] bg-tile px-5 pb-4 pt-5 lg:flex lg:gap-8 lg:px-7 lg:pb-7 lg:pt-7">
        <div className="lg:flex-1">
          <div className="flex items-center justify-between lg:hidden">
            <span className="t-label text-ink2">LA TUA QUOTA</span>
            <Live />
          </div>
          <span className="t-label hidden text-ink2 lg:block">LA TUA QUOTA</span>
          <div className="mt-[14px] flex items-end gap-[10px] lg:mt-[18px] lg:flex-col lg:items-start lg:gap-[22px]">
            <RDot text={estimatedCalories > 0 ? fmt(estimatedCalories) : "-"} p={[7, 8]} />
            <span className="t-label-s pb-[2px] text-ink2">KCAL/GIORNO</span>
          </div>
        </div>
        <div className="lg:w-[232px]">
          <div className="mb-4 hidden justify-end lg:flex"><Live /></div>
          <dl className="mt-[17px] flex flex-col gap-2 lg:mt-0 lg:gap-6">
            <QuotaRow k="BMR · MIFFLIN-ST JEOR" v={q ? fmt(q.bmr) : "–"} />
            <QuotaRow k={`× ATTIVITÀ ${fmt(getActivityMultiplier(activityLevel), 2)}`} v={q ? fmt(q.tdee) : "–"} />
            {q && q.goalAdjustment !== 0 && <QuotaRow k={q.goalAdjustment < 0 ? "− DEFICIT" : "+ SURPLUS"} v={fmt(Math.abs(q.goalAdjustment))} />}
          </dl>
        </div>
      </section>
    </>,
  ];

  return (
    <div className="min-h-screen bg-void text-ink lg:flex">
      {/* Pannello sinistro (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-[480px] shrink-0 flex-col bg-tile px-14 pb-[58px] pt-14 lg:flex">
        <Dot text="bilancio" p={4.2} />
        <h1 className="t-title-l mt-[83px]">Crea il tuo account</h1>
        <p className="t-body mt-[10px] max-w-[340px] text-ink2">Tre passaggi. Alla fine calcoliamo la tua quota calorica giornaliera.</p>
        <ol className="mt-[66px] flex flex-col">
          {STEPS.map((s, i) => (
            <li key={s.label} className="relative flex gap-[18px] pb-[56px]">
              <span className={`mt-[2px] size-[14px] shrink-0 rounded-full ${i === currentScreen ? "bg-signal" : i < currentScreen ? "bg-ink" : "bg-dotoff"}`} />
              {i < 2 && <span className="absolute left-[6.5px] top-6 h-[68px] border-l border-dashed border-ink3" />}
              <div>
                <div className={`t-label ${i <= currentScreen ? "text-ink" : "text-ink2"}`}>{i + 1} · {s.label}</div>
                <div className={`t-body-s mt-2 ${i <= currentScreen ? "text-ink" : "text-ink2"}`}>{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="t-body-s mt-auto text-ink2">Hai già un account? <Link to="/login" className="ml-[18px] text-ink underline underline-offset-2">Accedi</Link></p>
      </aside>

      <main className="flex-1 px-5 pb-10 pt-[15px] lg:px-0 lg:pl-40 lg:pt-[120px]">
        <div className="lg:w-[560px]">
          <div className="flex items-center justify-between lg:hidden">
            <button onClick={() => (currentScreen ? handlePrevScreen() : navigate("/login"))} aria-label="Indietro" className="cursor-pointer"><ArrowLeft size={22} strokeWidth={1.5} /></button>
            <span className="t-label text-ink2">{currentScreen + 1}/3</span>
          </div>
          <div className="mt-6 flex items-end justify-between lg:mt-0">
            <RDot text={step.title} p={[5, 6]} />
            <span className="t-label mb-[13px] hidden text-ink2 lg:block">{currentScreen + 1}/3</span>
          </div>
          <p className="t-body mt-[14px] text-ink2 lg:mt-[25px]">{step.sub}</p>

          {/* Avanzamento (mobile) */}
          <div className="mt-[18px] grid grid-cols-3 gap-2 lg:hidden">
            {STEPS.map((s, i) => (
              <div key={s.label}>
                <div className={`h-[6px] rounded-full ${i <= currentScreen ? "bg-ink" : "bg-dotoff"}`} />
                <div className={`t-label-s mt-2 ${i <= currentScreen ? "text-ink" : "text-ink2"}`}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-[30px] flex flex-col gap-[22px] lg:mt-8">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            {screens[currentScreen]}
          </div>

          <div className={`mt-[58px] flex gap-4 lg:justify-between ${currentScreen === 2 ? "!mt-6 lg:!mt-8" : ""}`}>
            {currentScreen > 0 && <Btn kind="secondary" className="flex-1 lg:w-[200px] lg:flex-none" onClick={handlePrevScreen}>Indietro</Btn>}
            {currentScreen === 0 && <Btn className="flex-1 lg:ml-auto lg:w-[200px] lg:flex-none" onClick={checkDataUser}>Avanti</Btn>}
            {currentScreen === 1 && <Btn className="flex-1 lg:w-[200px] lg:flex-none" onClick={handleNextScreen}>Avanti</Btn>}
            {currentScreen === 2 && <Btn className="flex-1 lg:w-[200px] lg:flex-none" onClick={handleSubmit}>Crea account</Btn>}
          </div>
          <p className="t-body-s mt-5 text-center text-ink2 lg:hidden">Hai già un account? <Link to="/login" className="ml-1 text-ink underline underline-offset-2">Accedi</Link></p>
        </div>
      </main>
    </div>
  );
};

const Live = () => (
  <span className="t-label flex items-center gap-[6px]"><span className="size-[6px] rounded-full bg-signal" />IN DIRETTA</span>
);

const QuotaRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-center justify-between"><dt className="t-label-s text-ink2">{k}</dt><dd className="t-data">{v}</dd></div>
);

export default Register;

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { Btn, Dot, ErrorBanner, Field, useIsDesktop } from "../components/ui"

/** Anello a tacche: quota consumata (decorativo, come nel Figma). */
export function Ring({ n, r, len, sw, on = 0.6, className = "" }: { n: number; r: number; len: number; sw: number; on?: number; className?: string }) {
    const s = r + sw
    return (
        <svg width={s * 2} height={s * 2} viewBox={`${-s} ${-s} ${s * 2} ${s * 2}`} className={className} aria-hidden>
            {Array.from({ length: n }, (_, i) => {
                const a = (i / n) * 2 * Math.PI, sin = Math.sin(a), cos = -Math.cos(a)
                return <line key={i} x1={sin * r} y1={cos * r} x2={sin * (r - len)} y2={cos * (r - len)} strokeWidth={sw} strokeLinecap="round" className={i < Math.round(n * on) ? "stroke-ink" : "stroke-dotoff"} />
            })}
        </svg>
    )
}

const Login: React.FC = () => {
    const [username, setusername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()
    const desktop = useIsDesktop()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("");
        // login() lancia su credenziali errate: senza catch l'errore non veniva mai mostrato
        if (await login(username, password).catch(() => false)) {
            navigate("/");
        } else {
            setError("Username o password non corretti. Controlla e riprova.");
        }
    }

    const form = (
        <form onSubmit={handleSubmit} className="flex flex-col">
            {error && <div className="mb-[26px] lg:mb-6"><ErrorBanner>{error}</ErrorBanner></div>}
            <Field label="USERNAME" icon={<User size={20} strokeWidth={1.5} />} value={username} onChange={(e) => setusername(e.target.value)}
                placeholder="giulia.f" autoComplete="username" error={!!error} />
            <Field label="PASSWORD" className="mt-[22px]" icon={<Lock size={20} strokeWidth={1.5} />} type={showPassword ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" error={!!error}
                right={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Nascondi password" : "Mostra password"} className="cursor-pointer text-ink2">
                        {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                } />
            <Btn type="submit" className="mt-9 w-full">Accedi</Btn>
            <p className="t-body-s mt-5 text-center text-ink2 lg:text-left">
                Non hai un account?{" "}
                <Link to="/register" className="ml-1 text-ink underline underline-offset-2">Registrati</Link>
            </p>
        </form>
    )

    return (
        <div className="min-h-screen bg-void text-ink lg:flex">
            {/* Pannello sinistro (desktop) */}
            <aside className="relative hidden w-1/2 shrink-0 flex-col bg-tile px-16 pb-[110px] pt-16 lg:flex">
                <Dot text="bilancio" p={5} />
                <Ring n={72} r={236} len={36} sw={7} className="absolute left-1/2 top-[187px] -translate-x-1/2" />
                <div className="absolute inset-x-0 top-[370px] flex flex-col items-center gap-[23px]">
                    <Dot text="687" p={14} />
                    <span className="t-label text-ink2">KCAL RIMANENTI · ESEMPIO</span>
                </div>
                <p className="t-title mt-auto max-w-[520px]">La quota calorica che ti serve davvero: calcolata sul tuo corpo, spesa pasto dopo pasto.</p>
                <span className="t-label mt-7 text-ink2">DIARIO · PESO · CODICI A BARRE</span>
            </aside>

            {/* Mobile */}
            {!desktop && <main className="relative overflow-hidden px-5 pb-10">
                {error ? <div className="h-[103px]" /> : (
                    <div className="h-[283px]"><Ring n={60} r={118} len={20} sw={5} className="absolute left-[169px] top-4" /></div>
                )}
                <Dot text="bilancio" p={6.6} />
                <p className="t-body mb-[34px] mt-[17px] max-w-[300px] text-ink2">Diario alimentare e peso, con una quota calorica calcolata su di te.</p>
                {form}
            </main>}

            {/* Form desktop */}
            {desktop && <main className="flex flex-1 items-center justify-center">
                <div className="w-[400px]">
                    <h1 className="t-title-l">Accedi</h1>
                    <p className="t-body mb-[38px] mt-[10px] text-ink2">Inserisci le tue credenziali per continuare.</p>
                    {form}
                </div>
            </main>}
        </div>
    )
}

export default Login


import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Mail, Lock, Utensils, Eye, EyeOff, AlertCircle, Moon } from "lucide-react"

const Login: React.FC = () => {
    const [username, setusername] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("");
        //todo: rimuovere questo
        if (login("admin@example.com", "password")) {
            navigate("/");
        } else {
            setError("Credenziali non valide. Usa admin@example.com / password");
        } 
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo e Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full mb-4 shadow-lg shadow-blue-500/25">
                        <Utensils className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">FoodTracker</h1>
                    <p className="text-gray-300">Traccia la tua alimentazione quotidiana</p>
                </div>

                {/* Card principale */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-2">Bentornato!</h2>
                        <p className="text-gray-300">Inserisci le tue credenziali per continuare</p>
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
                        {/* Campo username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                                username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="username"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setusername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700"
                                    placeholder="user123"
                                    //required
                                />
                            </div>
                        </div>

                        {/* Campo Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700"
                                    placeholder="••••••••"
                                    //required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Bottone di accesso */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25"
                        >
                            Accedi al tuo account
                        </button>
                    </form>
                    
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                        Non hai un account?{" "}
                        <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Registrati qui
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
    )
}

export default Login

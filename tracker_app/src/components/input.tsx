import React from "react";
import { Mail } from "lucide-react";

interface InputProps {
  label: string;
  value: string;
  placeHolder: string;
  onChange: (value: string) => void;
  type?: string; // Aggiunto per supportare diversi tipi di input, come "password"
  children?: React.ReactNode; // Aggiunto per supportare icone o altri elementi
}
const Input: React.FC<InputProps> = ({ label, value, onChange, placeHolder, type="text", children}) => {
  return (
    <div>
      <label
        htmlFor="username"
        className=" w-full block text-sm font-medium text-gray-200 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* //todo: modificare l'icona in base all'input */}
          {children}
        </div>
        {/* //todo: mettere che se è password, input deve essere "sicuro" */}
        <input
          type={type} // Aggiunto per supportare input numerici
          id="username"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-700/50 text-white placeholder-gray-400 focus:bg-gray-700"
          placeholder={placeHolder}
        />
      </div>
    </div>
  );
};

export default Input;

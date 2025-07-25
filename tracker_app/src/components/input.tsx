import React from "react";
import { Mail } from "lucide-react";

interface InputProps {
  label: string;
  value: string;
  placeHolder: string;
  onChange: (value: string) => void;
}
const Input: React.FC<InputProps> = ({ label, value, onChange, placeHolder}) => {
  return (
    <div>
      <label
        htmlFor="username"
        className="block text-sm font-medium text-gray-200 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* //todo: modificare l'icona in base all'input */}
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        {/* //todo: mettere che se è password, input deve essere "sicuro" */}
        <input
          type="text"
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

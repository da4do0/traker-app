import React from "react";
import { User } from "lucide-react";

import type { Sex } from "../interfaces/User"; // Ensure Sex is an enum or object, not just a type

interface RadioGroupProps {
  label: string;
  value: Sex;
  onChange: (value: Sex) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="w-full block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <div className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white">
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4 bg-gray-700 border-gray-600"
                checked={value === "Male"}
                onChange={() => onChange("Male")}
              />
              <span className="ml-2 text-white">Maschio</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4 bg-gray-700 border-gray-600"
                checked={value === "Female"}
                onChange={() => onChange("Female")}
              />
              <span className="ml-2 text-white">Femmina</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioGroup;

import React from "react";

interface RadioOption {
  value: string | number;
  label: string;
  description?: string;
}

interface FlexibleRadioGroupProps<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption[];
  icon?: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

function FlexibleRadioGroup<T extends string | number>({
  label,
  value,
  onChange,
  options,
  icon,
  className = "",
  vertical = true
}: FlexibleRadioGroupProps<T>) {
  return (
    <div className={className}>
      <label className="w-full block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
            {icon}
          </div>
        )}
        <div className={`block w-full ${icon ? 'pl-10' : ''} pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700/50`}>
          <div className={`flex ${vertical ? 'flex-col space-y-3' : 'flex-wrap gap-4'}`}>
            {options.map((option) => (
              <label key={option.value} className="inline-flex items-start cursor-pointer group">
                <input
                  type="radio"
                  className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4 bg-gray-700 border-gray-600 mt-0.5 flex-shrink-0"
                  checked={value === option.value}
                  onChange={() => onChange(option.value as T)}
                />
                <div className="ml-3 min-w-0">
                  <span className="text-white font-medium group-hover:text-blue-300 transition-colors">
                    {option.label}
                  </span>
                  {option.description && (
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlexibleRadioGroup;
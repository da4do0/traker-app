import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { ErrorDisplayProps } from '../types/FoodList';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  return (
    <div className="mb-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
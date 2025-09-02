import React, { useEffect } from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";
import Container from "./container";
import type { DeleteConfirmModalProps } from "../types/FoodList";

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  food,
  onConfirm,
  isLoading,
}) => {
  const handleConfirm = async () => {
    if (!food) return;
    await onConfirm(food.id);
  };

  if (!isOpen || !food) {
    console.log("DeleteConfirmModal opened for food:", food);
    return null;
  }

  useEffect(() => {
    console.log("DeleteConfirmModal opened for food:", food);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Container css="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-red-900/50 rounded-lg p-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">
                Conferma Eliminazione
              </h2>
              <p className="text-gray-400 text-sm">
                Questa azione non può essere annullata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Food Info */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            {food.imageUrl && (
              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="text-white font-medium">{food.name}</h3>
              <div className="text-sm text-gray-400">
                <span>
                  {food.quantity}g • {food.meal}
                </span>
              </div>
              <div className="text-sm text-orange-400 mt-1">
                {food.calories} kcal
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            Sei sicuro di voler eliminare questo alimento? I dati nutrizionali
            verranno rimossi dal tuo diario giornaliero.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Trash2 size={16} />
                Elimina
              </>
            )}
          </button>
        </div>
      </Container>
    </div>
  );
};

export default DeleteConfirmModal;

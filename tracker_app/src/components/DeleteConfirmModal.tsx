import React from "react";
import { Trash } from "lucide-react";
import type { DeleteConfirmModalProps } from "../types/FoodList";
import { Btn, Modal, fmt } from "./ui";

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
    return null;
  }

  return (
    <Modal onClose={isLoading ? () => {} : onClose} width={460} center>
      <span className="flex size-12 items-center justify-center rounded-full bg-signal/16">
        <Trash size={22} strokeWidth={1.6} />
      </span>
      <h2 className="t-title mt-5">Eliminare {food.name}?</h2>
      <p className="t-label mt-2 normal-case text-ink2">
        {fmt(food.quantity)} G · {food.meal} · {fmt(food.calories)} KCAL
      </p>
      <p className="t-body mt-[18px] text-ink2 lg:mt-4">
        Verrà tolto dal diario di oggi e dai totali. L’azione non si può annullare.
      </p>
      <div className="mt-[38px] flex gap-3 lg:justify-end">
        <Btn kind="secondary" onClick={onClose} disabled={isLoading} className="flex-1 lg:w-[150px] lg:flex-none">Annulla</Btn>
        <Btn kind="danger" onClick={handleConfirm} disabled={isLoading} className="flex-1 lg:w-[150px] lg:flex-none">
          {isLoading ? <span className="size-4 animate-spin rounded-full border-2 border-ink border-t-transparent" /> : "Elimina"}
        </Btn>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;

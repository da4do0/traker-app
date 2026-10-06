import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { MeasurementInput } from '../types/Measurement';
import { getBMICategory } from '../utils/weightCalculations';
import { BMI_IT, BmiScale } from './BodyMetricsGrid';
import { Btn, CloseBtn, Dot, Field, Modal, fmt } from './ui';

interface AddMeasurementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (measurement: MeasurementInput) => void;
    currentWeight?: number;
    currentHeight?: number;
}

export default function AddMeasurementModal({
    isOpen,
    onClose,
    onSave,
    currentWeight = 70,
    currentHeight = 170
}: AddMeasurementModalProps) {
    const [weight, setWeight] = useState(currentWeight);
    const [height, setHeight] = useState(currentHeight);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (weight <= 0 || height <= 0) {
            return;
        }

        setIsLoading(true);
        try {
            await onSave({
                weight,
                height,
                date
            });
            onClose();
        } catch (error) {
            console.error('Error saving measurement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > 0) {
            setWeight(value);
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > 0) {
            setHeight(value);
        }
    };

    if (!isOpen) return null;

    const bmi = weight / Math.pow(height / 100, 2);
    const category = getBMICategory(bmi);
    const diff = weight - currentWeight;

    return (
        <Modal onClose={isLoading ? () => {} : onClose} width={520}>
            {/* Header */}
            <div className="-mt-2 flex items-start justify-between lg:mt-0">
                <h2 className="t-title mt-1">Nuova misurazione</h2>
                <CloseBtn onClick={onClose} disabled={isLoading} />
            </div>

            {/* Form */}
            <div className="mt-3 flex flex-col gap-[22px]">
                <Field label="DATA" type="date" icon={<Calendar size={20} strokeWidth={1.5} />} value={date}
                    onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                <div className="grid grid-cols-2 gap-4">
                    <Field label="PESO" unit="KG" type="number" inputMode="decimal" value={weight} onChange={handleWeightChange} step="0.1" min="1" max="300" placeholder="70.0" />
                    <Field label="ALTEZZA" unit="CM" type="number" inputMode="numeric" value={height} onChange={handleHeightChange} step="1" min="100" max="250" placeholder="170" />
                </div>
            </div>

            {/* BMI Preview */}
            <div className="mt-7 rounded-[20px] bg-control px-5 pb-6 pt-[18px]">
                <div className="flex justify-between">
                    <span className="t-label text-ink2">BMI CALCOLATO</span>
                    <span className="t-label">{BMI_IT[category]}</span>
                </div>
                <div className="mt-3 flex"><Dot text={fmt(bmi, 1)} p={5} /></div>
                <BmiScale bmi={bmi} category={category} className="mt-5" />
            </div>
            <p className="t-body-s mt-4 text-ink2">Rispetto all’ultima: {diff < 0 ? "−" : diff > 0 ? "+" : ""}{fmt(Math.abs(diff), 1)} kg</p>

            {/* Actions */}
            <div className="mb-6 mt-16 flex gap-4 lg:-mb-2 lg:mt-9 lg:justify-end">
                <Btn kind="secondary" onClick={onClose} disabled={isLoading} className="flex-1 lg:w-[160px] lg:flex-none">Annulla</Btn>
                <Btn onClick={handleSave} disabled={isLoading || weight <= 0 || height <= 0} className="flex-1 lg:w-[160px] lg:flex-none">
                    {isLoading ? <span className="size-4 animate-spin rounded-full border-2 border-void border-t-transparent" /> : "Salva"}
                </Btn>
            </div>
        </Modal>
    );
}

import React, { useState } from 'react';
import { X, Save, Scale, Ruler, Calendar } from 'lucide-react';
import Container from './container';
import ButtonContainer from './ButtonContainer';
import type { MeasurementInput } from '../types/Measurement';

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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Container css="w-full max-w-md p-6 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Nuova Misurazione</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Date Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Calendar className="w-4 h-4" />
                            Data
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Weight Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Scale className="w-4 h-4" />
                            Peso (kg)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={weight}
                                onChange={handleWeightChange}
                                step="0.1"
                                min="1"
                                max="300"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="70.0"
                            />
                            <span className="absolute right-3 top-2 text-sm text-gray-400">kg</span>
                        </div>
                    </div>

                    {/* Height Input */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Ruler className="w-4 h-4" />
                            Altezza (cm)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={height}
                                onChange={handleHeightChange}
                                step="1"
                                min="100"
                                max="250"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="170"
                            />
                            <span className="absolute right-3 top-2 text-sm text-gray-400">cm</span>
                        </div>
                    </div>

                    {/* BMI Preview */}
                    <div className="bg-gray-800/30 rounded-lg p-3">
                        <p className="text-sm text-gray-400 mb-1">BMI Calcolato</p>
                        <p className="text-lg font-semibold text-emerald-400">
                            {((weight / Math.pow(height / 100, 2))).toFixed(1)}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8">
                    <ButtonContainer
                        color="gray"
                        onClick={onClose}
                        className="flex-1 py-3"
                        disabled={isLoading}
                    >
                        Annulla
                    </ButtonContainer>
                    <ButtonContainer
                        color="emerald"
                        onClick={handleSave}
                        className="flex-1 py-3 flex items-center justify-center gap-2"
                        disabled={isLoading || weight <= 0 || height <= 0}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Salva
                            </>
                        )}
                    </ButtonContainer>
                </div>
            </Container>
        </div>
    );
}
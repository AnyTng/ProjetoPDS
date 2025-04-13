import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const initialFormData = {
    aluguerId: '',
    data: '',
    valor: '',
};

const CreateMultaModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData); // Reset form when modal opens
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation example (can be expanded)
        if (!formData.aluguerId || !formData.data || !formData.valor) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        onSubmit(formData); // Pass data to parent handler
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-md relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800" aria-label="Fechar">
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Criar Nova Multa
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="aluguerId" className="block text-sm font-medium text-gray-700 mb-1">ID do Aluguer</label>
                        <InputFieldLong
                            id="aluguerId"
                            name="aluguerId"
                            type="text"
                            placeholder="Ex: ALG-123"
                            value={formData.aluguerId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">Data da Infração</label>
                        <InputFieldLong
                            id="data"
                            name="data"
                            type="date"
                            value={formData.data}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor da Infração (€)</label>
                        <InputFieldLong
                            id="valor"
                            name="valor"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 120.50"
                            value={formData.valor}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                        <Button text="Criar Multa" variant="primary" type="submit" className="!py-1.5" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMultaModal;
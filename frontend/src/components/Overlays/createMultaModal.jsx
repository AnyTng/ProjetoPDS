// src/components/Overlays/CreateMultaModal.jsx

import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const initialFormData = {
    dataInfracao: '',
    valorInfracao: '',
    matricula: '',
    descInfracao: '',
    dataLimPagInfracoes: '',
};

const CreateMultaModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const {
            dataInfracao,
            valorInfracao,
            matricula,
            descInfracao,
            dataLimPagInfracoes,
        } = formData;

        if (
            !dataInfracao ||
            !valorInfracao ||
            !matricula ||
            !descInfracao ||
            !dataLimPagInfracoes
        ) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        onSubmit(formData);
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
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800"
                    aria-label="Fechar"
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Criar Nova Multa
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="dataInfracao" className="block text-sm font-medium text-gray-700 mb-1">
                            Data da Infração
                        </label>
                        <InputFieldLong
                            id="dataInfracao"
                            name="dataInfracao"
                            type="date"
                            value={formData.dataInfracao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="valorInfracao" className="block text-sm font-medium text-gray-700 mb-1">
                            Valor da Infração (€)
                        </label>
                        <InputFieldLong
                            id="valorInfracao"
                            name="valorInfracao"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 120.50"
                            value={formData.valorInfracao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
                            Matrícula do Veículo
                        </label>
                        <InputFieldLong
                            id="matricula"
                            name="matricula"
                            type="text"
                            placeholder="Ex: BA-RB-IE"
                            value={formData.matricula}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="descInfracao" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição da Infração
                        </label>
                        <InputFieldLong
                            id="descInfracao"
                            name="descInfracao"
                            type="text"
                            placeholder="Ex: Estacionamento indevido"
                            value={formData.descInfracao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="dataLimPagInfracoes" className="block text-sm font-medium text-gray-700 mb-1">
                            Prazo de Pagamento
                        </label>
                        <InputFieldLong
                            id="dataLimPagInfracoes"
                            name="dataLimPagInfracoes"
                            type="date"
                            value={formData.dataLimPagInfracoes}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-6">
                        <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            className="!py-1.5"
                        />
                        <Button
                            text="Criar Multa"
                            variant="primary"
                            type="submit"
                            className="!py-1.5"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMultaModal;
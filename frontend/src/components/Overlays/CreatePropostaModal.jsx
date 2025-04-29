import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const initialFormData = {
    descProposta: '',
    valorProposta: '',
    dataInicioMan: '',
    dataFimMan: '',
};

const CreatePropostaModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
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

                <h2 className="text-xl font-semibold mb-6 text-center">
                    Nova Proposta
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="descProposta"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição
                        </label>
                        <textarea
                            id="descProposta"
                            name="descProposta"
                            rows="3"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={formData.descProposta}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="valorProposta"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Valor (€)
                        </label>
                        <input
                            type="number"
                            id="valorProposta"
                            name="valorProposta"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            value={formData.valorProposta}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="dataInicioMan"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Data Início
                            </label>
                            <input
                                type="date"
                                id="dataInicioMan"
                                name="dataInicioMan"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                value={formData.dataInicioMan}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="dataFimMan"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Data Fim
                            </label>
                            <input
                                type="date"
                                id="dataFimMan"
                                name="dataFimMan"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                value={formData.dataFimMan}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            onClick={onClose}
                            className="!py-1.5"
                        />
                        <Button
                            text="Enviar Proposta"
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

export default CreatePropostaModal;
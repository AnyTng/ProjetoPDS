import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';
import { fetchWithAuth } from '../../utils/api';

const initialFormData = { matricula: '', descDesp: '' };

const CreateConcursoModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => console.log('formData:', formData), [formData]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        const params = new URLSearchParams(formData).toString();
        const endpoint = `/api/Despesas/CriarConcurso?${params}`;

        try {
            const data = await fetchWithAuth(endpoint, { method: 'POST' });
            console.log('Criado:', data);
            setFormData(initialFormData);
            onClose();
        } catch (err) {
            console.error(err);
            alert(`Erro ao criar: ${err.message}`);
        }
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
                    Criar Novo Concurso
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="matricula"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Matrícula
                        </label>
                        <InputFieldLong
                            id="matricula"
                            name="matricula"
                            type="text"
                            placeholder="Matrícula"
                            value={formData.matricula}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="descDesp"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Descrição da Manutenção
                        </label>
                        <textarea
                            id="descDesp"
                            name="descDesp"
                            rows="4"
                            className="w-full p-2 mt-1 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm rounded"
                            placeholder="Descreva o tipo de manutenção necessária..."
                            value={formData.descDesp}
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
                            text="Confirmar Criação"
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

export default CreateConcursoModal;
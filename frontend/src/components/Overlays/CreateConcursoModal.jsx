import React, { useState, useEffect } from 'react';
import Button from '../button.jsx';
import InputFieldLong from '../inputFieldLong.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const initialFormData = {
    veiculoId: '',
    descricaoManutencao: '',
};

const CreateConcursoModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState(initialFormData);


    useEffect(() => {
        console.log("Estado formData ATUALIZADO:", formData);
    }, [formData]); // Corre sempre que formData mudar


    const handleChange = (e) => {
        const { name, value } = e.target;
        // *** DEBUG LOG *** Adiciona este console.log
        console.log(`handleChange - Name: ${name}, Value: ${value}`);
        setFormData(prev => ({ ...prev, [name]: value }));
    };


    const handleSubmit = (e) => {
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
                <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800" aria-label="Fechar">
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Criar Novo Concurso
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="veiculoId" className="block text-sm font-medium text-gray-700 mb-1">ID do Veículo</label>
                        <InputFieldLong
                            id="veiculoId"
                            name="veiculoId"
                            type="text"
                            placeholder="Ex: C-001 ou Matrícula"
                            value={formData.veiculoId} // Ligado ao estado
                            onChange={handleChange}      // Ligado ao handler
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="descricaoManutencao" className="block text-sm font-medium text-gray-700 mb-1">Descrição da Manutenção</label>
                        <textarea
                            id="descricaoManutencao"
                            name="descricaoManutencao"
                            rows="4"
                            className="w-full p-2 mt-1 border rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Descreva o tipo de manutenção necessária..."
                            value={formData.descricaoManutencao} // Ligado ao estado
                            onChange={handleChange}              // Ligado ao handler
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-6">
                        <Button text="Cancelar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                        <Button text="Confirmar Criação" variant="primary" type="submit" className="!py-1.5" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateConcursoModal;
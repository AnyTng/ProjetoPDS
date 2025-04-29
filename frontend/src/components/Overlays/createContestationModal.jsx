import React, { useState } from 'react';
import Button from '../button.jsx';
import XIcon from '../../assets/XIconBlack.svg';
import { fetchWithAuth } from '../../utils/api';

const CreateContestationModal = ({ isOpen, onClose, infracaoId, onSuccess }) => {
    const [descContestacao, setDescContestacao] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!descContestacao.trim()) {
            setError('Por favor, insira uma descrição para a contestação.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetchWithAuth(
                `/api/Contestacoes/CriarContestacao?descContestacao=${encodeURIComponent(descContestacao)}&idInf=${infracaoId}`,
                { method: 'POST' }
            );

            if (response) {
                onSuccess && onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Erro ao submeter contestação:', err);
            setError('Não foi possível submeter a contestação. Por favor, tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-lg relative"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800" 
                    aria-label="Fechar"
                    disabled={isSubmitting}
                >
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                    Contestar Multa
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID da Infração
                        </label>
                        <input
                            type="text"
                            value={infracaoId}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                            disabled
                        />
                        <p className="mt-1 text-xs text-gray-500">Este campo não pode ser alterado</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição da Contestação
                        </label>
                        <textarea
                            value={descContestacao}
                            onChange={(e) => setDescContestacao(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 min-h-[150px]"
                            placeholder="Descreva os motivos da sua contestação..."
                            disabled={isSubmitting}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-2">
                        <Button 
                            text="Cancelar" 
                            variant="secondary" 
                            type="button" 
                            onClick={onClose} 
                            className="!py-1.5"
                            disabled={isSubmitting}
                        />
                        <Button 
                            text={isSubmitting ? "A submeter..." : "Submeter Contestação"} 
                            variant="primary" 
                            type="submit" 
                            className="!py-1.5"
                            disabled={isSubmitting}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContestationModal;
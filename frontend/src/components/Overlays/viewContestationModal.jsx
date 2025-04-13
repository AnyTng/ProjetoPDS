import React from 'react';
import Button from '../button.jsx';
import XIcon from '../../assets/XIconBlack.svg';

const ViewContestationModal = ({ isOpen, onClose, contestationText, isLoading }) => {

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-lg relative" // Increased max-w
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800" aria-label="Fechar">
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                    Detalhes da Contestação
                </h2>

                <div className="mt-4 p-4 border rounded bg-gray-50 min-h-[150px]">
                    {isLoading ? (
                        <p className="text-sm text-gray-500 italic text-center">A carregar texto...</p>
                    ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {contestationText || "Não foi possível carregar o texto da contestação."}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button text="Fechar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                </div>
            </div>
        </div>
    );
};

export default ViewContestationModal;
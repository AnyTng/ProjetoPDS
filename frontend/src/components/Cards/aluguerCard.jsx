import Button from "../button.jsx";
import { useState } from "react";
import ClassificacaoOverlay from "../ClassificacaoOverlay.jsx";

const AluguerCard = ({
    idaluguer,
    cliente,
    veiculo,
    dataLevantamento,
    dataEntregaPrevista,
    estadoAluguer,
    valorReserva,
    valorQuitacao,
    dataDevolucao,
    dataFatura,
    classificacao,
    onDownloadFatura
}) => {
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [currentRating, setCurrentRating] = useState(classificacao || 0);

    const handleRatingClose = (newRating) => {
        setIsRatingOpen(false);
        if (newRating && newRating !== currentRating) {
            setCurrentRating(newRating);
        }
    };
    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT');
    };

    // Determine card color based on state
    const getStateColor = (state) => {
        switch (state?.toLowerCase()) {
            case "pendente": return "bg-yellow-50 border-yellow-200";
            case "cancelado": return "bg-red-50 border-red-200";
            case "aguardar levantamento": return "bg-blue-50 border-blue-200";
            case "alugado": return "bg-green-50 border-green-200";
            case "concluido": return "bg-purple-50 border-purple-200";
            default: return "bg-gray-50 border-gray-200";
        }
    };

    // Get state icon based on state
    const getStateIcon = (state) => {
        switch (state?.toLowerCase()) {
            case "pendente":
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "cancelado":
                return (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case "aguardar levantamento":
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case "alugado":
                return (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case "concluido":
                return (
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    // Determine if invoice can be downloaded
    const canDownloadFatura = estadoAluguer?.toLowerCase() === "concluido" && dataFatura;

    // Determine if rental can be rated
    const canRateAluguer = estadoAluguer?.toLowerCase() === "concluido";

    return (
        <div className={`w-full border rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm ${getStateColor(estadoAluguer)}`}>
            <div className="flex flex-col gap-4">
                {/* Status Header */}
                <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                        {getStateIcon(estadoAluguer)}
                        <span className="font-semibold text-lg">{estadoAluguer}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        ID: {idaluguer}
                    </div>
                </div>

                {/* Rental Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="font-semibold text-slate-900">Veículo:</span>
                        <span className="text-slate-700">{veiculo?.marca} {veiculo?.modelo} ({veiculo?.matriculaVeiculo})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-slate-900">Levantamento:</span>
                        <span className="text-slate-700">{formatDate(dataLevantamento)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-slate-900">Entrega Prevista:</span>
                        <span className="text-slate-700">{formatDate(dataEntregaPrevista)}</span>
                    </div>
                    {dataDevolucao && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-semibold text-slate-900">Devolução:</span>
                            <span className="text-slate-700">{formatDate(dataDevolucao)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-slate-900">Valor Reserva:</span>
                        <span className="text-slate-700">{valorReserva}€</span>
                    </div>
                    {valorQuitacao && (
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-semibold text-slate-900">Valor Quitação:</span>
                            <span className="text-slate-700">{valorQuitacao}€</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end mt-2 gap-3">
                {canRateAluguer && (
                    <Button
                        text={currentRating > 0 ? `Classificação: ${currentRating}/5` : "Avaliar Aluguer"}
                        variant="secondary"
                        onClick={() => setIsRatingOpen(true)}
                        className="px-6 !py-1 text-base flex items-center gap-2"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        }
                    />
                )}
                {canDownloadFatura && (
                    <Button
                        text="Transferir Fatura"
                        variant="primary"
                        onClick={() => onDownloadFatura(idaluguer)}
                        className="px-6 !py-1 text-base flex items-center gap-2"
                        icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        }
                    />
                )}

                {/* Rating Overlay */}
                <ClassificacaoOverlay
                    isOpen={isRatingOpen}
                    onClose={handleRatingClose}
                    idAluguer={idaluguer}
                    initialRating={currentRating}
                />
            </div>
        </div>
    );
};

export default AluguerCard;

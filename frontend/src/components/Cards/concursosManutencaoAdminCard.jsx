import React, { useState } from 'react';
import Button from "../button.jsx";
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate

const ConcursosManutencaoAdminCard = ({
                                          carroId,
                                          carroNome,
                                          estado,
                                          TipoManutencao,
                                          valor,
                                          imageUrl,
                                          concursoId,
                                      }) => {
    const isFinalizado = estado === "aceite" || estado === "finalizado";
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);
    const navigate = useNavigate(); // 2. Obter a função navigate

    const buttonLabel = isFinalizado ? "Transferir Fatura" : "Ver Propostas";

    const handleButtonClick = async () => {
        if (isFinalizado) {
            // Lógica para transferir fatura (mantém-se como na resposta anterior)
            setIsDownloading(true);
            setDownloadError(null);
            console.log(`[API Placeholder] Tentando transferir fatura para concurso ID: ${concursoId}`);
            try {
                // CÓDIGO API FETCH/DOWNLOAD (placeholder ou real)
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
                alert(`Transferência simulada da fatura para o concurso ${concursoId} iniciada.`);
            } catch (error) {
                console.error("Erro ao transferir fatura:", error);
                setDownloadError(error.message || "Não foi possível transferir a fatura.");
                alert(`Erro ao transferir fatura: ${error.message}`);
            } finally {
                setIsDownloading(false);
            }
        } else {
            // 3. Lógica para navegar para ver propostas
            console.log("Navegando para ver propostas do concurso ID:", concursoId);
            // Define a rota para a página de propostas específicas.
            // Certifica-te que esta rota existe no teu ficheiro de Rotas e
            // que a página correspondente sabe como usar o ID do concurso da URL.
            navigate(`/admin/propostas/${concursoId}`); // Ajusta a rota se necessário
        }
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Imagem */}
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {imageUrl ? (
                        <img src={imageUrl} alt={`Foto de ${carroNome}`} className="w-full h-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 110 8 4 4 0 010-8zM16 14H8a4 4 0 00-4 4v1h16v-1a4 4 0 00-4-4z" />
                        </svg>
                    )}
                </div>

                {/* Informações */}
                <div className="flex-1 grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    {/* ... (campos de informação como antes) ... */}
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Carro:</span>
                        <span>{carroId || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Estado:</span>
                        <span>{estado || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Nome:</span>
                        <span>{carroNome || 'N/A'}</span>
                    </div>
                    {isFinalizado && (
                        <div className="flex gap-2">
                            <span className="font-semibold text-slate-900 min-w-[110px]">Valor:</span>
                            <span>{valor ? (String(valor).includes('€') ? valor : `€${Number(valor).toFixed(2)}`) : 'N/A'}</span>
                        </div>
                    )}
                    <div className="flex gap-2 col-span-2">
                        <span className="font-semibold text-slate-900 min-w-[110px]">Tipo Manutenção:</span>
                        <span>{TipoManutencao || 'N/A'}</span>
                    </div>
                    {downloadError && isFinalizado && (
                        <div className="col-span-2 text-xs text-red-600 mt-1">
                            Erro: {downloadError}
                        </div>
                    )}
                </div>
            </div>

            {/* Botão */}
            <div className="flex justify-end">
                <Button
                    text={isDownloading ? "A transferir..." : buttonLabel}
                    variant="primary"
                    onClick={handleButtonClick} // Função atualizada para incluir navigate
                    className="px-6 py-2 text-base"
                    disabled={isDownloading}
                />
            </div>
        </div>
    );
};

export default ConcursosManutencaoAdminCard;
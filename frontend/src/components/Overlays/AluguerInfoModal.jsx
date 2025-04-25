import React, { useState } from 'react';
import Button from '../button.jsx'; // Importa o seu componente Button
import XIcon from '../../assets/XIconBlack.svg';
import { fetchWithAuth } from "../../utils/api";

// Funções auxiliares para formatar (mantidas)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    } catch (e) {
        return 'Data inválida';
    }
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numericValue = Number(value);
    if (isNaN(numericValue)) return 'Valor inválido';
    return `€${numericValue.toFixed(2).replace('.', ',')}`;
};

// Componente Modal atualizado
const AluguerInfoModal = ({ isOpen, onClose, aluguerData, onStatusUpdate }) => {

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    if (!isOpen || !aluguerData) return null;

    // Extrair dados do aluguerData, incluindo objetos nested
    const {
        idaluguer,
        cliente,        // Objeto Cliente
        veiculo,        // Objeto Veiculo
        dataLevantamento,
        dataEntregaPrevista,
        dataDevolucao,
        dataFatura,
        classificacao,
        valorReserva,
        valorQuitacao,
        estadoAluguer: currentEstadoAluguer,
    } = aluguerData || {}; // Fallback para aluguerData

    // Extrair detalhes do cliente e veículo com fallbacks
    const nomeCliente = cliente?.nomeCliente || 'N/D';
    const matriculaVeiculo = veiculo?.matriculaVeiculo || 'N/D';
    const marcaVeiculo = veiculo?.marca || '';
    const modeloVeiculo = veiculo?.modelo || '';
    const veiculoDisplay = `${marcaVeiculo} ${modeloVeiculo} (${matriculaVeiculo})`; // Combina marca/modelo/matrícula

    // Calcular Valor Total (Mantido)
    const valorTotal = (Number(valorReserva) || 0) + (Number(valorQuitacao) || 0);

    // Função para chamar a API de atualização de estado (Mantida)
    const handleUpdateEstado = async (novoEstado) => {
        if (!idaluguer) return;
        setIsUpdating(true);
        setUpdateError(null);
        try {
            const apiUrl = `/api/Alugueres/atualizaestado?id=${idaluguer}&estadoAluguer=${encodeURIComponent(novoEstado)}`;
            await fetchWithAuth(apiUrl, { method: 'PUT' });
            window.location.reload(); // Mantido conforme pedido anterior
        } catch (err) {
            console.error(`Erro ao atualizar estado para ${novoEstado}:`, err);
            setUpdateError(err.message || `Falha ao atualizar estado para ${novoEstado}.`);
            setIsUpdating(false);
        }
    };

    // Função para marcar como concluído (Mantida)
    const handleMarcCompleted = async () => {
        if (!idaluguer) return;
        setIsUpdating(true);
        setUpdateError(null);
        try {
            const apiUrl = `/api/Alugueres/entrega?idAluguer=${idaluguer}`;
            await fetchWithAuth(apiUrl, { method: 'PUT' });
            window.location.reload(); // Mantido
        } catch (err) {
            console.error('Erro ao marcar como concluído:', err);
            setUpdateError(err.message || 'Falha ao marcar como concluído.');
            setIsUpdating(false);
        }
    }


    // Condições de estado e botões (Mantidas)
    const canUpdateStatus = currentEstadoAluguer?.toLowerCase() !== 'concluido' &&
        currentEstadoAluguer?.toLowerCase() !== 'cancelado';
    const isAlreadyAlugado = currentEstadoAluguer?.toLowerCase() === 'alugado';
    const canCancel = currentEstadoAluguer?.toLowerCase() === 'pendente' ||
        currentEstadoAluguer?.toLowerCase() === 'aguarda levantamento';


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={isUpdating ? undefined : onClose}
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-lg relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800 disabled:opacity-50" aria-label="Fechar" disabled={isUpdating}>
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Detalhes do Aluguer #{idaluguer || ''}
                </h2>

                {/* Grid para mostrar os detalhes (Read-Only) - Atualizado para mostrar dados nested */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6">
                    {/* Campo Cliente Atualizado */}
                    <div className="flex flex-col md:col-span-2"> {/* Ocupa as duas colunas */}
                        <span className="font-semibold text-gray-500 mb-1">Cliente:</span>
                        <span className="text-gray-800">{nomeCliente}</span>
                    </div>
                    {/* Campo Veículo Atualizado */}
                    <div className="flex flex-col md:col-span-2"> {/* Ocupa as duas colunas */}
                        <span className="font-semibold text-gray-500 mb-1">Veículo:</span>
                        <span className="text-gray-800">{veiculoDisplay}</span>
                    </div>
                    {/* Restantes campos mantidos */}
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Levantamento:</span>
                        <span className="text-gray-800">{formatDate(dataLevantamento)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Entrega Prevista:</span>
                        <span className="text-gray-800">{formatDate(dataEntregaPrevista)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Devolução Efetiva:</span>
                        <span className="text-gray-800">{formatDate(dataDevolucao)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Data Fatura:</span>
                        <span className="text-gray-800">{formatDate(dataFatura)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Valor Reserva:</span>
                        <span className="text-gray-800">{formatCurrency(valorReserva)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Valor Quitação:</span>
                        <span className="text-gray-800">{formatCurrency(valorQuitacao)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Valor Total:</span>
                        <span className="text-gray-800 font-bold">{formatCurrency(valorTotal)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-500 mb-1">Classificação:</span>
                        <span className="text-gray-800">{classificacao ?? 'N/A'}</span>
                    </div>
                    <div className="flex flex-col md:col-span-2">
                        <span className="font-semibold text-gray-500 mb-1">Estado Atual:</span>
                        <span className="text-gray-800 font-medium">{currentEstadoAluguer || 'N/D'}</span>
                    </div>
                </div>

                {/* Mensagem de Erro de Atualização (Mantida) */}
                {updateError && (
                    <div className="text-red-600 text-sm text-center mb-4 -mt-2">{updateError}</div>
                )}

                {/* Botões de Ação (Lógica Mantida) */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                    {canUpdateStatus && (
                        <>
                            {!isAlreadyAlugado && (
                                <Button
                                    text={isUpdating ? "A processar..." : "Marcar Alugado"}
                                    variant="primary"
                                    type="button"
                                    onClick={() => handleUpdateEstado('Alugado')}
                                    disabled={isUpdating}
                                />
                            )}
                            {canCancel && ( // Usa a variável canCancel
                                <Button
                                    text={isUpdating ? "A processar..." : "Cancelar Aluguer"}
                                    variant="danger"
                                    type="button"
                                    onClick={() => handleUpdateEstado('Cancelado')}
                                    disabled={isUpdating}
                                />
                            )}
                            {isAlreadyAlugado && ( // Botão Terminar
                                <Button
                                    text={isUpdating ? "A processar..." : "Terminar"}
                                    variant="primary" // Ou outra variante se preferir
                                    type="button"
                                    onClick={() => handleMarcCompleted()}
                                    disabled={isUpdating}
                                />
                            )}
                        </>
                    )}
                    <Button
                        text="Fechar"
                        variant="secondary"
                        type="button"
                        onClick={onClose}
                        disabled={isUpdating}
                    />
                </div>
            </div>
        </div>
    );
};

export default AluguerInfoModal;
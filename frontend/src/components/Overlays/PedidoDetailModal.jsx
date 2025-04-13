import React from 'react';
import Button from '../button.jsx';
import XIcon from '../../assets/XIconBlack.svg';

// Função auxiliar para formatar datas (opcional)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        // Tenta criar data e formatar. Ajusta locale e options conforme necessário.
        return new Date(dateString).toLocaleDateString('pt-PT', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    } catch (e) {
        return dateString; // Retorna original se inválido
    }
};

// Função auxiliar para formatar valores monetários (opcional)
const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    // Remove caracteres não numéricos exceto ponto e vírgula, troca vírgula por ponto
    const numericValue = Number(String(value).replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) return 'N/A';
    return `€${numericValue.toFixed(2)}`;
};


const PedidoDetailModal = ({ isOpen, onClose, pedidoData, onApprove, onReject }) => {

    if (!isOpen || !pedidoData) return null; // Não renderiza se fechado ou sem dados

    // Extrair dados com fallbacks
    const {
        id, // ID do pedido para as ações
        valorReserva = 'N/D', // Placeholder - API precisa fornecer
        value, // Usado para Valor Quitação
        startDate,
        endDate,
        carroId = 'N/D',
        userId = 'N/D',
        dataPedido = 'N/D' // Placeholder - API precisa fornecer
    } = pedidoData;

    // Determinar o estado do pedido para lógica condicional dos botões
    // Assumindo que o estado vem em pedidoData.status
    const isPending = pedidoData.status?.toLowerCase() === 'pendente'; // Ajustar se o nome do estado for diferente


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose} // Fecha ao clicar fora
        >
            <div
                className="bg-white p-6 md:p-8 rounded-xl shadow-lg w-full max-w-lg relative"
                onClick={e => e.stopPropagation()} // Impede fechar ao clicar dentro
            >
                {/* Botão Fechar */}
                <button onClick={onClose} className="absolute top-4 right-4 w-6 h-6 text-gray-500 hover:text-gray-800" aria-label="Fechar">
                    <img src={XIcon} alt="Fechar" className="w-full h-full" />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
                    Detalhes do Pedido de Aluguer #{id || ''}
                </h2>

                {/* Grid para mostrar os detalhes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {/* Usar spans para label e valor */}
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">ID Cliente:</span>
                        <span className="text-slate-700">{userId}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">ID Carro:</span>
                        <span className="text-slate-700">{carroId}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">Data do Pedido:</span>
                        <span className="text-slate-700">{formatDate(dataPedido)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">Data de Entrega:</span>
                        <span className="text-slate-700">{formatDate(startDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">Data de Devolução:</span>
                        <span className="text-slate-700">{formatDate(endDate)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">Valor Reserva:</span>
                        <span className="text-slate-700">{formatCurrency(valorReserva)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 mb-1">Valor Quitação/Total:</span>
                        <span className="text-slate-700">{formatCurrency(value)}</span>
                    </div>
                    {/* Mostrar o estado atual */}
                    <div className="flex flex-col md:col-span-2">
                        <span className="font-semibold text-slate-900 mb-1">Estado Atual:</span>
                        <span className="text-slate-700 font-medium">{pedidoData.status || 'N/D'}</span>
                    </div>
                </div>

                {/* Botões de Ação - Mostrar apenas se o pedido estiver pendente */}
                {isPending && (
                    <div className="flex justify-end gap-4 pt-8">
                        <Button
                            text="Rejeitar"
                            variant="danger" // Ou 'secondary' ou 'text'
                            type="button"
                            onClick={() => onReject(id)} // Chama a função do pai com o ID
                            className="!py-1.5"
                        />
                        <Button
                            text="Aprovar"
                            variant="primary"
                            type="button"
                            onClick={() => onApprove(id)} // Chama a função do pai com o ID
                            className="!py-1.5"
                        />
                    </div>
                )}
                {/* Botão Fechar (sempre visível, ou pode ser removido se o 'X' for suficiente) */}
                {!isPending && (
                    <div className="flex justify-end gap-4 pt-8">
                        <Button text="Fechar" variant="secondary" type="button" onClick={onClose} className="!py-1.5" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PedidoDetailModal;
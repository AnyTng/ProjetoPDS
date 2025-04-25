import Button from "../button.jsx";
// Remover a importação de ícones Lu se não forem mais usados noutras partes que foram removidas.
// Se ainda forem usados (ex: dentro do corpo), mantenha-os.
// import { LuCalendarDays, LuUser, LuCar, LuEuro } from 'react-icons/lu';

// Função auxiliar para formatar datas
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    } catch (e) {
        return 'Inválida';
    }
};

// Função auxiliar para formatar valores monetários
const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numericValue = Number(value);
    if (isNaN(numericValue)) return 'Inválido';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(numericValue);
};

// Função para obter a cor do estado (Mantida da versão anterior)
const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    // Ajustar estes casos se necessário para corresponder aos estados exatos da API
    if (lowerStatus === 'confirmado' || lowerStatus === 'ativo' || lowerStatus === 'alugado') return 'bg-green-100 text-green-800';
    if (lowerStatus === 'pendente' || lowerStatus === 'aguarda levantamento') return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus === 'cancelado' || lowerStatus === 'rejeitado') return 'bg-red-100 text-red-800';
    if (lowerStatus === 'concluido') return 'bg-blue-100 text-blue-800'; // Mudado para Azul para consistência com ícone
    return 'bg-gray-100 text-gray-800'; // Default
};

// Função para obter o ícone do estado (Copiada de AluguerCard.jsx)
const getStateIcon = (state) => {
    switch (state?.toLowerCase()) {
        case "pendente":
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "cancelado": // Adicionado || rejeitado se for o caso
        case "rejeitado":
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case "aguarda levantamento":
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case "ativo": // Adicionado || alugado
        case "alugado":
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
        case "concluido":
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        // Adicionar caso para "confirmado" se for diferente de "ativo"/"alugado"
        case "confirmado":
            return ( // Exemplo: usar mesmo ícone de ativo/alugado
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
        default:
            return ( // Ícone default
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};


const PedidoAluguerCard = ({ aluguerData, onVerInfoClick }) => {

    const {
        idaluguer,
        veiculoIdveiculo = 'N/D',
        clienteIdcliente = 'N/D',
        dataLevantamento,
        dataEntregaPrevista,
        valorQuitacao,
        estadoAluguer = 'N/D'
    } = aluguerData || {};

    const statusColorClasses = getStatusColor(estadoAluguer);
    const statusIcon = getStateIcon(estadoAluguer); // Obter o ícone

    return (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden flex flex-col">

            {/* Cabeçalho do Card */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-3">
                <h3 className="text-base font-semibold text-gray-800 truncate"> {/* Ajustado tamanho e truncagem */}
                    Aluguer #{idaluguer}
                </h3>
                {/* Badge de Estado com Ícone */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColorClasses}`}>
                     {statusIcon} {/* Adiciona o ícone aqui */}
                    {estadoAluguer}
                </span>
            </div>

            {/* Corpo do Card com Detalhes */}
            <div className="px-5 py-4 flex-grow">
                {/* Manter a estrutura grid como estava, apenas os ícones de detalhe foram removidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        {/* <LuUser className="w-4 h-4 text-gray-500 shrink-0" /> */} {/* Ícone removido se não desejado */}
                        <span className="font-medium text-gray-600 min-w-[60px]">Cliente:</span>
                        <span>{clienteIdcliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        {/* <LuCar className="w-4 h-4 text-gray-500 shrink-0" /> */}
                        <span className="font-medium text-gray-600 min-w-[60px]">Veículo:</span>
                        <span>{veiculoIdveiculo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        {/* <LuCalendarDays className="w-4 h-4 text-gray-500 shrink-0" /> */}
                        <span className="font-medium text-gray-600 min-w-[60px]">Levant.:</span>
                        <span>{formatDate(dataLevantamento)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        {/* <LuCalendarDays className="w-4 h-4 text-gray-500 shrink-0" /> */}
                        <span className="font-medium text-gray-600 min-w-[60px]">Entrega:</span>
                        <span>{formatDate(dataEntregaPrevista)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                        {/* <LuEuro className="w-4 h-4 text-gray-500 shrink-0" /> */}
                        <span className="font-medium text-gray-600 min-w-[60px]">Valor Total:</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(valorQuitacao)}</span>
                    </div>
                </div>
            </div>

            {/* Rodapé com Botão */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <Button
                    text="Ver Detalhes"
                    variant="primary"
                    onClick={onVerInfoClick}
                    className="px-4 py-1.5 text-sm"
                />
            </div>
        </div>
    );
};

export default PedidoAluguerCard;
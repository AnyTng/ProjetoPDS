import Button from "../button.jsx";

// Funções auxiliares (mantidas)
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

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numericValue = Number(value);
    if (isNaN(numericValue)) return 'Inválido';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(numericValue);
};

const getStatusColor = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'confirmado' || lowerStatus === 'ativo' || lowerStatus === 'alugado') return 'bg-green-100 text-green-800';
    if (lowerStatus === 'pendente' || lowerStatus === 'aguarda levantamento') return 'bg-yellow-100 text-yellow-800';
    if (lowerStatus === 'cancelado' || lowerStatus === 'rejeitado') return 'bg-red-100 text-red-800';
    if (lowerStatus === 'concluido') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
};

const getStateIcon = (state) => {
    switch (state?.toLowerCase()) {
        case "pendente": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case "cancelado": case "rejeitado": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case "aguarda levantamento": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case "ativo": case "alugado": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
        case "concluido": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case "confirmado": return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
        default: return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};


const PedidoAluguerCard = ({ aluguerData, onVerInfoClick }) => {

    // Extrai dados da nova estrutura, incluindo nested objects
    const {
        idaluguer,
        cliente,        // Objeto Cliente
        veiculo,        // Objeto Veiculo
        dataLevantamento,
        dataEntregaPrevista,
        valorQuitacao,  // Pode querer usar valorReserva ou ambos
        estadoAluguer = 'N/D'
    } = aluguerData || {}; // Fallback para aluguerData

    // Extrair detalhes do cliente e veículo com fallbacks
    const nomeCliente = cliente?.nomeCliente || 'N/D';
    // const contactoCliente = cliente?.contactoC1 || 'N/D'; // Exemplo se precisar
    // const nifCliente = cliente?.nifcliente || 'N/D';     // Exemplo se precisar
    const matriculaVeiculo = veiculo?.matriculaVeiculo || 'N/D';
    const marcaVeiculo = veiculo?.marca || '';
    const modeloVeiculo = veiculo?.modelo || '';
    const veiculoDisplay = `${marcaVeiculo} ${modeloVeiculo} (${matriculaVeiculo})`; // Combina marca/modelo/matrícula

    const statusColorClasses = getStatusColor(estadoAluguer);
    const statusIcon = getStateIcon(estadoAluguer);

    return (
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out overflow-hidden flex flex-col">

            {/* Cabeçalho do Card */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center gap-3">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                    Aluguer #{idaluguer}
                </h3>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColorClasses}`}>
                     {statusIcon}
                    {estadoAluguer}
                </span>
            </div>

            {/* Corpo do Card com Detalhes */}
            <div className="px-5 py-4 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {/* Linha Cliente */}
                    <div className="flex items-center gap-2 text-gray-700 md:col-span-2"> {/* Ocupa duas colunas em desktop */}
                        <span className="font-medium text-gray-600 min-w-[70px]">Cliente:</span>
                        <span>{nomeCliente}</span>
                    </div>
                    {/* Linha Veículo */}
                    <div className="flex items-center gap-2 text-gray-700 md:col-span-2"> {/* Ocupa duas colunas em desktop */}
                        <span className="font-medium text-gray-600 min-w-[70px]">Veículo:</span>
                        <span>{veiculoDisplay}</span>
                    </div>
                    {/* Linha Datas */}
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium text-gray-600 min-w-[70px]">Levant.:</span>
                        <span>{formatDate(dataLevantamento)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium text-gray-600 min-w-[70px]">Entrega:</span>
                        <span>{formatDate(dataEntregaPrevista)}</span>
                    </div>
                    {/* Linha Valor */}
                    <div className="flex items-center gap-2 text-gray-700 md:col-span-2"> {/* Ocupa duas colunas em desktop */}
                        <span className="font-medium text-gray-600 min-w-[70px]">Valor Total:</span>
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
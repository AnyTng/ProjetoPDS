import React from 'react';
import Button from '../button.jsx';

const statusMap = {
    'Aguarda Pagamento':      'bg-yellow-100 text-yellow-800',
    'Paga':                   'bg-green-100 text-green-800',
    'Expirada':               'bg-gray-100 text-gray-800',
    'Contestada':             'bg-blue-100 text-blue-800',
    'Contestação Aceite':     'bg-green-50 text-green-900',
    'Contestação Negada':     'bg-red-100 text-red-800',
    'Cancelada':              'bg-red-50 text-red-900',
};

const MultaCardAdmin = ({ multa, onViewContestationClick, onCancelClick }) => {
    const {
        idinf,
        descInf,
        dataInf,
        dataLimPagInf,
        valorInf,
        estadoInf,
        estadoContestacao,
        matriculaVeiculo,
        nomeCliente,
        nomeMarca,
        nomeModelo,
    } = multa;

    // Determine display status
    let displayStatus;
    if (estadoContestacao) {
        switch (estadoContestacao) {
            case 'Aceite': displayStatus = 'Contestação Aceite'; break;
            case 'Negada': displayStatus = 'Contestação Negada'; break;
            case 'Paga':   displayStatus = 'Paga';             break;
            default:       displayStatus = 'Contestada';       break;
        }
    } else if (estadoInf === 'Submetida') {
        displayStatus = 'Aguarda Pagamento';
    } else {
        displayStatus = estadoInf;
    }

    const canCancel = !['Cancelada', 'Paga'].includes(estadoInf);
    const badgeClasses = statusMap[displayStatus] || 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-200 p-6 flex flex-col justify-between gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-gray-800">Multa #{idinf}</h3>
                    <p className="text-gray-600">{descInf}</p>
                </div>
                <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClasses}`}>
          {displayStatus}
        </span>
            </div>

            {/* Body */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="space-y-1">
                    <p><strong>Cliente:</strong> {nomeCliente}</p>
                    <p><strong>Veículo:</strong> {nomeMarca} {nomeModelo}</p>
                    <p><strong>Matrícula:</strong> {matriculaVeiculo}</p>
                </div>
                <div className="space-y-1">
                    <p><strong>Valor:</strong> €{valorInf.toFixed(2)}</p>
                    <p><strong>Infração:</strong> {new Date(dataInf).toLocaleDateString('pt-PT')}</p>
                    <p><strong>Prazo Pagamento:</strong> {new Date(dataLimPagInf).toLocaleDateString('pt-PT')}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {estadoContestacao && (
                    <Button
                        variant="secondary"
                        onClick={onViewContestationClick}
                        text="Ver Contestação"
                        className="px-4 py-2 text-sm"
                    />
                )}

                {canCancel && (
                    <Button
                        variant="danger"
                        onClick={onCancelClick}
                        text="Cancelar"
                        className="px-4 py-2 text-sm"
                    />
                )}
            </div>
        </div>
    );
};

export default MultaCardAdmin;

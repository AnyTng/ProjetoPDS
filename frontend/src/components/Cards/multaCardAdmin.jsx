// src/components/Cards/multaCardAdmin.jsx

import React from 'react';
import Button from '../button.jsx';

const statusMap = {
    'Aguarda Pagamento':     'bg-yellow-100    text-yellow-800',
    'Paga':                  'bg-green-100     text-green-800',
    'Expirada':              'bg-gray-100      text-gray-800',
    'Contestada':            'bg-blue-100      text-blue-800',
    'Contestação Aceite':    'bg-green-50      text-green-900',
    'Contestação Rejeitada': 'bg-red-100       text-red-800',
    'Cancelada':             'bg-red-50        text-red-900',
};

const MultaCardAdmin = ({ multa, onEditClick, onViewContestationClick }) => {
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

    // Determinar estado a mostrar
    let displayStatus;
    if (estadoContestacao) {
        if (estadoContestacao === 'Aceite') displayStatus = 'Contestação Aceite';
        else if (estadoContestacao === 'Rejeitada') displayStatus = 'Contestação Rejeitada';
        else displayStatus = 'Contestada';
    } else if (estadoInf === 'Submetida') {
        displayStatus = 'Aguarda Pagamento';
    } else {
        displayStatus = estadoInf; // Paga, Expirada, Cancelada…
    }

    const badgeClasses = statusMap[displayStatus] ?? 'bg-gray-100 text-gray-800';

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
            {/* Header */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold"><b>Multa {idinf}:</b> {descInf}</h3>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses}`}
                    >
            {displayStatus}
          </span>
                </div>

                {/* Cliente + Veículo */}
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Cliente:</strong> {nomeCliente}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Veículo:</strong> {nomeMarca} {nomeModelo}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Matrícula:</strong> {matriculaVeiculo}
                </p>

                {/* Valor */}
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Valor:</strong> €{valorInf.toFixed(2)}
                </p>

                {/* Datas */}
                <div className="text-sm text-gray-600">
                    <div>
                        <strong>Infração:</strong>{' '}
                        {new Date(dataInf).toLocaleDateString('pt-PT')}
                    </div>
                    <div>
                        <strong>Prazo Pagamento:</strong>{' '}
                        {new Date(dataLimPagInf).toLocaleDateString('pt-PT')}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <Button
                    text="Editar"
                    variant="primary"
                    onClick={onEditClick}
                    className="px-4 py-2 text-sm"
                />

                {estadoContestacao && (
                    <Button
                        text="Ver Contestação"
                        variant="secondary"
                        onClick={onViewContestationClick}
                        className="px-4 py-2 text-sm"
                    />
                )}
            </div>
        </div>
    );
};

export default MultaCardAdmin;
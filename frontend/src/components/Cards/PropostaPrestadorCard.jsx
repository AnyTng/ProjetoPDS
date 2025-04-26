// src/components/Cards/PropostaPrestadorCard.jsx
import React from "react";

const badgeStyles = {
    Pendente:  "bg-yellow-100 text-yellow-800",
    Aceite:    "bg-green-100  text-green-800",
    Rejeitada: "bg-red-100    text-red-800",
    Cancelada: "bg-gray-100   text-gray-800",
};

const PropostaPrestadorCard = ({ proposta }) => {
    const {
        idmanutencao,
        descProposta,
        valorProposta,
        estadoProposta,
        dataInicioMan,
        dataFimMan,
        despesaIddespesaNavigation,
    } = proposta;

    // Navigate nested vehicle → model → brand if present
    const veiculo   = despesaIddespesaNavigation?.veiculoIdveiculoNavigation;
    const modeloNav = veiculo?.modeloVeiculoIdmodeloNavigation;
    const marcaNav  = modeloNav?.marcaVeiculoIdmarcaNavigation;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{descProposta}</h3>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[estadoProposta] ?? "bg-gray-100 text-gray-800"}`}
                    >
                        {estadoProposta}
                    </span>
                </div>

                {/* ID da proposta */}
                <p className="text-sm text-gray-600 mb-2">
                    <strong>ID:</strong> <span className="font-medium text-gray-800">{idmanutencao}</span>
                </p>

                {/* Valor */}
                <p className="text-sm text-gray-600 mb-2">
                    <strong>Valor:</strong> <span className="font-medium text-gray-800">{valorProposta}</span>
                </p>

                {/* Marca e Modelo, se existir */}
                {marcaNav && modeloNav && (
                    <p className="text-sm text-gray-600 mb-2">
                        <strong>Veículo:</strong>{" "}
                        <span className="font-medium text-gray-800">
                            {marcaNav.descMarca} {modeloNav.descModelo}
                        </span>
                    </p>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                    <div>
                        <strong>Início:</strong> {new Date(dataInicioMan).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Fim:</strong> {dataFimMan ? new Date(dataFimMan).toLocaleDateString() : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropostaPrestadorCard;

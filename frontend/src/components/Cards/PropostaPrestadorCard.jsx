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
        descProposta,
        valorProposta,
        estadoProposta,
        dataInicioMan,
        dataFimMan,
    } = proposta;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{descProposta}</h3>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                            badgeStyles[estadoProposta] ?? "bg-gray-100 text-gray-800"
                        }`}
                    >
            {estadoProposta}
          </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                    <div>
                        <strong>Valor:</strong>{" "}
                        {valorProposta.toLocaleString("pt-PT", {
                            style: "currency",
                            currency: "EUR",
                        })}
                    </div>
                    <div>
                        <strong>Início:</strong>{" "}
                        {new Date(dataInicioMan).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Fim:</strong>{" "}
                        {dataFimMan ? new Date(dataFimMan).toLocaleDateString() : "—"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropostaPrestadorCard;
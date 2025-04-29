// src/components/Cards/propostaCardAdmin.jsx

import React from "react";
import Button from "../button.jsx";

const badgeStyles = {
    Pendente:  "bg-yellow-100 text-yellow-800",
    Aceite:    "bg-green-100 text-green-800",
    Rejeitada: "bg-red-100 text-red-800",
    Cancelado: "bg-gray-100 text-gray-800"
};

const PropostaCardAdmin = ({
                               idmanutencao,
                               descProposta,
                               valorProposta,
                               estadoProposta,
                               dataInicioMan,
                               dataFimMan,
                               concursoState,
                               onAceitar,
    nomeEmpresa
                           }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{descProposta}</h3>
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                        badgeStyles[estadoProposta] || "bg-gray-100 text-gray-800"
                    }`}
                >
          {estadoProposta}
        </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
                <div>
                    <strong>Empresa:</strong> {nomeEmpresa}
                </div>

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

        {/* Só mostra o botão "Aceitar" se o concurso estiver ativo */}
        {concursoState === "Ativo" && (
            <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
                <Button
                    text="Aceitar"
                    variant="primary"
                    onClick={() => onAceitar(idmanutencao)}
                    className="px-4 py-1 text-sm"
                />
            </div>
        )}
    </div>
);

export default PropostaCardAdmin;
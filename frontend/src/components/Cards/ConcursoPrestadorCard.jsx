import React from "react";
import Button from "../button.jsx";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/api";

const badgeStyles = {
    Ativo:             "bg-green-100    text-green-800",
    Concluido:         "bg-blue-100     text-blue-800",
    Cancelado:         "bg-red-100      text-red-800",
};

const ConcursoPrestadorCard = ({ concurso }) => {
    const {
        iddespesa,
        descConcurso,
        estadoConcurso,
        dataInicio,
        dataFim,
        caminhoFaturaPDF,
        veiculoIdveiculoNavigation,
    } = concurso;

    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
            {/* Header */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{descConcurso}</h3>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[estadoConcurso] ?? "bg-gray-100 text-gray-800"}`}
                    >
                        {estadoConcurso}
                    </span>
                </div>

                {/* Brand + Model */}
                {veiculoIdveiculoNavigation?.modeloVeiculoIdmodeloNavigation?.marcaVeiculoIdmarcaNavigation && (
                    <p className="text-sm text-gray-600 mb-2">
                        Veículo: {veiculoIdveiculoNavigation.modeloVeiculoIdmodeloNavigation.marcaVeiculoIdmarcaNavigation.descMarca}{" "}
                        {veiculoIdveiculoNavigation.modeloVeiculoIdmodeloNavigation.descModelo}
                    </p>
                )}

                {veiculoIdveiculoNavigation?.matriculaVeiculo && (
                    <p className="text-sm text-gray-600 mb-2">
                        Matrícula: {veiculoIdveiculoNavigation.matriculaVeiculo}
                    </p>
                )}

                {/* Dates */}
                <div className="text-sm text-gray-600">
                    <div>
                        Início: {new Date(dataInicio).toLocaleDateString()}
                    </div>
                    {dataFim && (
                        <div>
                            Fim: {new Date(dataFim).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <Button
                    text="As minhas propostas"
                    variant="primary"
                    onClick={() => navigate(`/prestador/concursos/${iddespesa}`)}
                    className="px-4 py-2 text-sm"
                />

                {caminhoFaturaPDF && (
                    <a
                        href={`${API_BASE_URL}/${caminhoFaturaPDF}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded bg-indigo-100 text-indigo-800 text-sm"
                    >
                        Transferir Fatura
                    </a>
                )}
            </div>
        </div>
    );
};

export default ConcursoPrestadorCard;

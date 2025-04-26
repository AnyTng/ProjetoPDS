import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "../button.jsx";
import { API_BASE_URL } from '../../utils/api';

const badgeStyles = {
    Ativo:    'bg-green-100 text-green-800',
    Encerrado:'bg-gray-100 text-gray-800',
    Cancelado:'bg-red-100 text-red-800',
};

const ConcursosManutencaoAdminCard = ({
                                          iddespesa,
                                          descConcurso,
                                          estadoConcurso,
                                          dataInicio,
                                          dataFim,
                                          caminhoFaturaPDF,
                                          veiculoIdveiculoNavigation
                                      }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            {/* Cabeçalho */}
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{descConcurso}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[estadoConcurso]}`}>
            {estadoConcurso}
          </span>
                </div>

                {veiculoIdveiculoNavigation?.matriculaVeiculo && (
                    <p className="text-sm text-gray-600 mb-2">
                        Matrícula: {veiculoIdveiculoNavigation.matriculaVeiculo}
                    </p>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                    <div>
                        <strong>Início:</strong>{' '}
                        {new Date(dataInicio).toLocaleString()}
                    </div>
                    {dataFim && (
                        <div>
                            <strong>Fim:</strong>{' '}
                            {new Date(dataFim).toLocaleString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Rodapé */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                {caminhoFaturaPDF ? (
                    <a
                        href={`${API_BASE_URL}/${caminhoFaturaPDF}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                    >
                        Ver Fatura
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">Sem fatura</span>
                )}

                <Button
                    text="Ver Detalhes"
                    variant="primary"
                    className="text-sm py-1.5 px-4"
                    onClick={() => navigate(`/admin/concursos/${iddespesa}`)}
                />
            </div>
        </div>
    );
};

export default ConcursosManutencaoAdminCard;
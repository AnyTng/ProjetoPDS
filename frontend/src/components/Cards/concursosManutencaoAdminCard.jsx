// src/components/Cards/ConcursosManutencaoAdminCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../button.jsx';
import { API_BASE_URL } from '../../utils/api';

const badgeStyles = {
    Ativo:              'bg-green-100    text-green-800',
    'Em Manutenção':    'bg-yellow-100   text-yellow-800',
    Concluido:          'bg-blue-100     text-blue-800',
    Cancelado:          'bg-red-100      text-red-800',
    'Fatura Submetida': 'bg-purple-100  text-purple-800',
};

const ConcursosManutencaoAdminCard = ({
                                          iddespesa,
                                          descConcurso,
                                          estadoConcurso,
                                          dataInicio,
                                          dataFim,
                                          veiculoIdveiculoNavigation,
                                      }) => {
    const navigate = useNavigate();

    // Brand and model navigation
    const modeloNav = veiculoIdveiculoNavigation?.modeloVeiculoIdmodeloNavigation;
    const marcaNav = modeloNav?.marcaVeiculoIdmarcaNavigation;

    // Determine if invoice download link should show
    const hasInvoice = estadoConcurso === 'Fatura Submetida';

    return (
        <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col justify-between">
            {/* Badge */}
            <span
                className={`absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full ${badgeStyles[estadoConcurso] ?? 'bg-gray-100 text-gray-800'}`}
            >
                {estadoConcurso}
            </span>

            {/* Conteúdo */}
            <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900">{descConcurso}</h3>

                {veiculoIdveiculoNavigation?.matriculaVeiculo && (
                    <p className="text-sm text-gray-600">
                        Matrícula: <span className="font-medium text-gray-800">{veiculoIdveiculoNavigation.matriculaVeiculo}</span>
                    </p>
                )}

                {/* Marca + Modelo */}
                {marcaNav && modeloNav && (
                    <p className="text-sm text-gray-600">
                        Veículo: <span className="font-medium text-gray-800">
                            {marcaNav.descMarca} {modeloNav.descModelo}
                        </span>
                    </p>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                    <div>
                        <strong className="font-medium">Início:</strong>{' '}
                        {new Date(dataInicio).toLocaleString()}
                    </div>
                    {dataFim && (
                        <div>
                            <strong className="font-medium">Fim:</strong>{' '}
                            {new Date(dataFim).toLocaleString()}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                {hasInvoice ? (
                    <a
                        href={`${API_BASE_URL}/api/Despesas/DownloadFatura/${iddespesa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline text-indigo-600 hover:text-indigo-800"
                    >
                        Transferir Fatura
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">Sem fatura</span>
                )}

                <Button
                    text="Ver Detalhes"
                    variant="primary"
                    className="px-6 py-2 text-sm font-medium"
                    onClick={() => navigate(`/admin/concursos/${iddespesa}`)}
                />
            </div>
        </div>
    );
};

export default ConcursosManutencaoAdminCard;

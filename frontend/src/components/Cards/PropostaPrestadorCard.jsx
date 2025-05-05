import React, { useState } from "react";
import Button from "../button.jsx";
import { fetchWithAuth, API_BASE_URL } from "../../utils/api";

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

    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const veiculo   = despesaIddespesaNavigation?.veiculoIdveiculoNavigation;
    const modeloNav = veiculo?.modeloVeiculoIdmodeloNavigation;
    const marcaNav  = modeloNav?.marcaVeiculoIdmarcaNavigation;

    const handleSubmitInvoice = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("pdf", file);
            await fetchWithAuth(
                `/api/Despesas/SubmeterFatura?idConcurso=${despesaIddespesaNavigation.iddespesa}`,
                { method: "PUT", body: formData }
            );
            alert("Fatura submetida com sucesso.");
            setFile(null);
        } catch (err) {
            console.error("Erro ao submeter fatura:", err);
            setError(err.message || "Falha no envio da fatura.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{descProposta}</h3>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                            badgeStyles[estadoProposta] || "bg-gray-100 text-gray-800"
                        }`}
                    >
                        {estadoProposta}
                    </span>
                </div>

                <div className="space-y-2 text-gray-700">
                    <p>
                        <strong className="font-medium">ID do Concurso:</strong>{" "}{despesaIddespesaNavigation?.iddespesa}
                    </p>
                    <p>
                        <strong className="font-medium">ID da Proposta:</strong>{" "}{idmanutencao}
                    </p>
                    <p>
                        <strong className="font-medium">Valor:</strong>{" "}{valorProposta}
                    </p>
                    {marcaNav && modeloNav && (
                        <p>
                            <strong className="font-medium">Veículo:</strong>{" "}{marcaNav.descMarca} {modeloNav.descModelo}
                        </p>
                    )}
                    <p>
                        <strong className="font-medium">Início:</strong>{" "}{new Date(dataInicioMan).toLocaleDateString()}
                    </p>
                    <p>
                        <strong className="font-medium">Fim:</strong>{" "}{dataFimMan ? new Date(dataFimMan).toLocaleDateString() : "—"}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                {/* Upload PDF when fatura can be submitted */}
                {despesaIddespesaNavigation?.estadoConcurso === "Concluido" && estadoProposta === "Aceite" && (
                    <div className="flex items-center space-x-3 mb-2">
                        <input
                            id={`pdf-input-${despesaIddespesaNavigation.iddespesa}`}
                            type="file"
                            accept="application/pdf"
                            onChange={e => setFile(e.target.files[0] || null)}
                            className="hidden"
                        />
                        <label
                            htmlFor={`pdf-input-${despesaIddespesaNavigation.iddespesa}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                            {file ? file.name : "Escolher PDF"}
                        </label>
                        <Button
                            text={uploading ? "Enviando..." : "Enviar Fatura"}
                            variant="primary"
                            onClick={handleSubmitInvoice}
                            disabled={!file || uploading}
                            className="px-4 py-2 text-sm"
                        />
                    </div>
                )}

                {/* Download PDF if already submitted */}
                {despesaIddespesaNavigation?.estadoConcurso === "Fatura Submetida" && despesaIddespesaNavigation.caminhoFaturaPDF && estadoProposta === "Aceite"&& (
                    <a
                        href={`${API_BASE_URL}/api/Despesas/DownloadFatura/${despesaIddespesaNavigation.iddespesa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md bg-indigo-50 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                        Transferir Fatura
                    </a>
                )}

                {/* Display error if exists */}
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        </div>
    );
};

export default PropostaPrestadorCard;
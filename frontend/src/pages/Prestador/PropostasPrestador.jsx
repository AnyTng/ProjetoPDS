// src/pages/Prestador/PropostasPrestador.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PropostaPrestadorCard from "../../components/Cards/PropostaPrestadorCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import CreatePropostaModal from "../../components/Overlays/CreatePropostaModal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";

const PropostasPrestador = () => {
    const { concursoId } = useParams();
    const { user } = useAuth();

    const [search, setSearch] = useState("");
    const [propostas, setPropostas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPropostas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const all = await fetchWithAuth(
                `/api/Manutencoes/PropostaEmp?idConcurso=${concursoId}`
            );
            setPropostas(
                all.filter(p => String(p.despesaIddespesa) === concursoId)
            );
        } catch (err) {
            console.error("Erro ao buscar propostas:", err);
            setError(err.message || "Não foi possível carregar as propostas.");
        } finally {
            setIsLoading(false);
        }
    }, [concursoId]);

    useEffect(() => {
        fetchPropostas();
    }, [fetchPropostas]);

    const handleCreateProposta = async ({
                                            descProposta,
                                            valorProposta,
                                            dataInicioMan,
                                            dataFimMan,
                                        }) => {
        const params = new URLSearchParams({
            idConcurso: concursoId,
            descProposta,
            valorProposta,
            dataIn: dataInicioMan,
            dataFim: dataFimMan,
        }).toString();

        try {
            await fetchWithAuth(
                `/api/Manutencoes/FazerProposta?${params}`,
                { method: "POST" }
            );
            setIsModalOpen(false);
            fetchPropostas();
        } catch (err) {
            console.error("Erro ao fazer proposta:", err);
            alert(`Falha ao enviar proposta: ${err.message}`);
        }
    };

    const filtered = !isLoading && !error
        ? propostas.filter(p =>
            p.descProposta.toLowerCase().includes(search.toLowerCase()) ||
            p.valorProposta.toString().includes(search)
        )
        : [];

    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar…</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">{error}</div>;
    } else if (!filtered.length) {
        content = <div className="p-6 text-center text-gray-600">Sem propostas.</div>;
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6">
                {filtered.map(p => (
                    <PropostaPrestadorCard key={p.idmanutencao} proposta={p} />
                ))}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                title={`As minhas Propostas para #${concursoId}`}
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por descrição ou valor…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Nova Proposta"
                        onClick={() => setIsModalOpen(true)}
                    />
                }
            >
                {content}
            </DashboardLayout>

            <CreatePropostaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProposta}
            />
        </>
    );
};

export default PropostasPrestador;
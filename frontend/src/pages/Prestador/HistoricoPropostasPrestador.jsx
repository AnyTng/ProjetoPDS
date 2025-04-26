// src/pages/Prestador/HistoricoPropostasPrestador.jsx
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PropostaPrestadorCard from "../../components/Cards/PropostaPrestadorCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";

const HistoricoPropostasPrestador = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [propostas, setPropostas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all proposals (no filtering by concurso)
    const fetchPropostas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Manutencoes/PropostaEmp");
            setPropostas(data);
        } catch (err) {
            console.error("Erro ao buscar histórico de propostas:", err);
            setError(err.message || "Não foi possível carregar propostas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPropostas();
    }, [fetchPropostas]);

    // Filter only by search text, not by concurso ID
    const filtered = !isLoading && !error
        ? propostas.filter(p =>
            p.descProposta.toLowerCase().includes(search.toLowerCase()) ||
            p.valorProposta.toString().includes(search)
        )
        : [];

    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar histórico…</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">{error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="p-6 text-center text-gray-600">Nenhuma proposta encontrada.</div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                {filtered.map(proposta => (
                    <PropostaPrestadorCard key={proposta.idmanutencao} proposta={proposta} />
                ))}
            </div>
        );
    }

    return (
        <DashboardLayout
            title="Histórico de Propostas"
            email={user?.email}
            filter={
                <FilterInput
                    placeholder="Pesquisar por descrição ou valor…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            }
        >
            {content}
        </DashboardLayout>
    );
};

export default HistoricoPropostasPrestador;

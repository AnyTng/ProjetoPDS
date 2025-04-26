// src/pages/Admin/ConcursosPrestador.jsx
import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import ConcursoPrestadorCard from "../../components/Cards/ConcursoPrestadorCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";

const ConcursosPrestador = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [concursos, setConcursos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchConcursos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Despesas/ConcursosAtivos");
            setConcursos(data);
        } catch (err) {
            console.error("Erro ao buscar concursos ativos:", err);
            setError(err.message || "Erro ao carregar concursos ativos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConcursos();
    }, [fetchConcursos]);

    const filtered = !isLoading && !error
        ? concursos.filter(c =>
            c.descConcurso.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar concursos ativos…</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">{error}</div>;
    } else if (filtered.length === 0) {
        content = <div className="p-6 text-center text-gray-600">Nenhum concurso ativo encontrado.</div>;
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6">
                {filtered.map(c => (
                    <ConcursoPrestadorCard key={c.iddespesa} concurso={c} />
                ))}
            </div>
        );
    }

    return (
        <DashboardLayout
            title="Concursos Ativos"
            email={user?.email}
            filter={
                <FilterInput
                    placeholder="Pesquisar por descrição…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            }
        >
            {content}
        </DashboardLayout>
    );
};

export default ConcursosPrestador;
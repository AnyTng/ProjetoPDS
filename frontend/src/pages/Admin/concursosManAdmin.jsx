import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import ConcursosManutencaoAdminCard from "../../components/Cards/concursosManutencaoAdminCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import CreateConcursoModal from "../../components/Overlays/CreateConcursoModal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api";

const ConcursosManAdmin = () => {
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [concursos, setConcursos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchConcursos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Despesas/Concursos");
            // Ordena por ID decrescente
            data.sort((a, b) => b.iddespesa - a.iddespesa);
            setConcursos(data);
        } catch (err) {
            console.error("Erro ao buscar concursos:", err);
            setError(err.message || "Ocorreu um erro ao carregar os concursos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConcursos();
    }, [fetchConcursos]);

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    // Após criar o concurso, recarrega toda a página
    const handleCreateConcurso = async () => {
        // espera que o modal já tenha enviado o POST
        // e atualizado o backend, então recarrega:
        window.location.reload();
    };

    // Filtra por ID, descrição ou matrícula
    const filtered = !isLoading && !error
        ? concursos.filter(item => {
            const term = search.toLowerCase();
            const idMatch = item.iddespesa.toString().includes(term);
            const descMatch = item.descConcurso.toLowerCase().includes(term);
            const matMatch = (item.veiculoIdveiculoNavigation?.matriculaVeiculo || "")
                .toLowerCase()
                .includes(term);
            return idMatch || descMatch || matMatch;
        })
        : [];

    let content;
    if (isLoading) {
        content = (
            <div className="p-6 text-center text-gray-500">
                A carregar concursos...
            </div>
        );
    } else if (error) {
        content = (
            <div className="p-6 text-center text-red-600">
                {error}
            </div>
        );
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    Nenhum concurso encontrado.
                </p>
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6">
                {filtered.map(concurso => (
                    <ConcursosManutencaoAdminCard
                        key={concurso.iddespesa}
                        iddespesa={concurso.iddespesa}
                        descConcurso={concurso.descConcurso}
                        estadoConcurso={concurso.estadoConcurso}
                        dataInicio={concurso.dataInicio}
                        dataFim={concurso.dataFim}
                        caminhoFaturaPDF={concurso.caminhoFaturaPDF}
                        veiculoIdveiculoNavigation={concurso.veiculoIdveiculoNavigation}
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                title="Concursos e Manutenções"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID, matrícula ou descrição..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Novo Concurso"
                        onClick={handleOpenCreateModal}
                        disabled={isLoading}
                    />
                }
            >
                {content}
            </DashboardLayout>

            <CreateConcursoModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateConcurso}
            />
        </>
    );
};

export default ConcursosManAdmin;
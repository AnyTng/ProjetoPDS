// src/pages/admin/MultasPageAdmin.jsx

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import MultaCardAdmin from "../../components/Cards/multaCardAdmin.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import CreateMultaModal from "../../components/Overlays/CreateMultaModal.jsx";
import ViewContestationModal from "../../components/Overlays/ViewContestationModal.jsx";
import { fetchWithAuth } from "../../utils/api";

const MultasPageAdmin = () => {
    const { user } = useAuth();

    const [multas, setMultas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewContestationModalOpen, setIsViewContestationModalOpen] = useState(false);

    const [selectedMulta, setSelectedMulta] = useState(null);
    const [contestationText, setContestationText] = useState("");
    const [isFetchingContestation, setIsFetchingContestation] = useState(false);

    // Busca todas as multas
    const fetchMultas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Infracoes/vermultasAdmin");
            setMultas(data);
        } catch (err) {
            console.error("Erro ao buscar multas:", err);
            setError(err.message || "Ocorreu um erro ao buscar as multas.");
            setMultas([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMultas();
    }, []);

    // Filtra lista pelo input de pesquisa
    const filtered = multas.filter((m) =>
        m.idinf.toString().includes(search.toLowerCase()) ||
        (m.nomeCliente || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.matriculaVeiculo || "").toLowerCase().includes(search.toLowerCase())
    );

    // Fecha todos os modais
    const handleCloseModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewContestationModalOpen(false);
        setSelectedMulta(null);
        setContestationText("");
    };

    // Abre modal de criação
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);

    // Cria multa (POST) e recarrega lista
    const handleCreateMulta = async (formData) => {
        const { dataInfracao, valorInfracao, matricula, descInfracao, dataLimPagInfracoes } = formData;

        setIsLoading(true);
        try {
            const qs = new URLSearchParams({
                dataInfracao,
                valorInfracao,
                matricula,
                descInfracao,
                dataLimPagInfracoes,
            }).toString();

            await fetchWithAuth(`/api/Infracoes/inserir-multa?${qs}`, {
                method: "POST",
            });

            handleCloseModals();
            await fetchMultas();
        } catch (err) {
            console.error("Erro ao criar multa:", err);
            alert("Erro ao criar a multa: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Abre modal de contestação
    const handleOpenViewContestationModal = async (multa) => {
        if (!multa.idCont) return;
        setIsFetchingContestation(true);
        setContestationText("");
        setIsViewContestationModalOpen(true);
        try {
            // Exemplo de fetch real:
            // const { texto } = await fetchWithAuth(`/api/admin/contestacoes/${multa.idCont}`);
            await new Promise((res) => setTimeout(res, 500));
            setContestationText(`Simulação de texto da contestação #${multa.idCont}.`);
        } catch (err) {
            console.error("Erro ao buscar contestação:", err);
            setContestationText("Erro ao carregar a contestação.");
        } finally {
            setIsFetchingContestation(false);
        }
    };

    // Define o conteúdo central
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar multas…</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhuma multa encontrada." : "Não há multas registadas."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((multa) => (
                    <MultaCardAdmin
                        key={multa.idinf}
                        multa={multa}
                        onEditClick={() => handleOpenEditModal(multa.idinf)}
                        onViewContestationClick={() => handleOpenViewContestationModal(multa)}
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                title="Multas"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID, cliente ou matrícula…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Nova Multa"
                        onClick={handleOpenCreateModal}
                        disabled={isLoading || !!error}
                    />
                }
            >
                {content}
            </DashboardLayout>

            <CreateMultaModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleCreateMulta}
            />

            {selectedMulta && (
                <EditMultaModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModals}
                    onSubmit={(formData) => handleUpdateMulta(selectedMulta.idinf, formData)}
                    multaData={selectedMulta}
                />
            )}

            <ViewContestationModal
                isOpen={isViewContestationModalOpen}
                onClose={handleCloseModals}
                isLoading={isFetchingContestation}
                contestationText={contestationText}
            />
        </>
    );
};

export default MultasPageAdmin;
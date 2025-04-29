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
    const [isViewContestationModalOpen, setIsViewContestationModalOpen] = useState(false);

    const [selectedMulta, setSelectedMulta] = useState(null);
    const [contestationText, setContestationText] = useState("");
    const [isFetchingContestation, setIsFetchingContestation] = useState(false);
    const [isProcessingContestationAction, setIsProcessingContestationAction] = useState(false);

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
        setSelectedMulta(multa);
        setIsViewContestationModalOpen(true);
        try {
            // Usar o texto da contestação que já vem na resposta da API
            setContestationText(multa.descContestacao || "Não foi possível carregar o texto da contestação.");
        } catch (err) {
            console.error("Erro ao processar contestação:", err);
            setContestationText("Erro ao carregar a contestação.");
        } finally {
            setIsFetchingContestation(false);
        }
    };

    // Aceita a contestação
    const handleAcceptContestation = async (contestationId) => {
        setIsProcessingContestationAction(true);
        try {
            await fetchWithAuth(`/api/Contestacoes/AlterarContestacao?id=${contestationId}&estadoContestacao=Aceite`, {
                method: "PUT"
            });
            alert("Contestação aceite com sucesso!");
            handleCloseModals();
            await fetchMultas(); // Recarrega a lista de multas
        } catch (err) {
            console.error("Erro ao aceitar contestação:", err);
            alert("Erro ao aceitar a contestação: " + err.message);
        } finally {
            setIsProcessingContestationAction(false);
        }
    };

    // Rejeita a contestação
    const handleRejectContestation = async (contestationId) => {
        setIsProcessingContestationAction(true);
        try {
            await fetchWithAuth(`/api/Contestacoes/AlterarContestacao?id=${contestationId}&estadoContestacao=Negada`, {
                method: "PUT"
            });
            alert("Contestação rejeitada com sucesso!");
            handleCloseModals();
            await fetchMultas(); // Recarrega a lista de multas
        } catch (err) {
            console.error("Erro ao rejeitar contestação:", err);
            alert("Erro ao rejeitar a contestação: " + err.message);
        } finally {
            setIsProcessingContestationAction(false);
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


            <ViewContestationModal
                isOpen={isViewContestationModalOpen}
                onClose={handleCloseModals}
                isLoading={isFetchingContestation || isProcessingContestationAction}
                contestationText={contestationText}
                contestationId={selectedMulta?.idCont}
                contestationStatus={selectedMulta?.estadoContestacao}
                onAccept={handleAcceptContestation}
                onReject={handleRejectContestation}
            />
        </>
    );
};

export default MultasPageAdmin;

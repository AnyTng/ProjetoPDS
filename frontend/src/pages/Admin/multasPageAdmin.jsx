
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import MultaCardAdmin from "../../components/Cards/multaCardAdmin.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import CreateMultaModal from "../../components/Overlays/CreateMultaModal.jsx";
import EditMultaModal from "../../components/Overlays/EditMultaModal.jsx";
import ViewContestationModal from "../../components/Overlays/ViewContestationModal.jsx";

const MultasPageAdmin = () => {
    const [multas, setMultas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewContestationModalOpen, setIsViewContestationModalOpen] = useState(false);

    const [selectedMulta, setSelectedMulta] = useState(null);
    const [contestationText, setContestationText] = useState("");
    const [isFetchingContestation, setIsFetchingContestation] = useState(false);

    // --- Fetch Initial Multas (API Ready) ---
    const fetchMultas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("[API Placeholder] Fetching multas...");
            // SUBSTITUIR PELA CHAMADA API REAL
            await new Promise(resolve => setTimeout(resolve, 500));
            // const response = await fetch('/api/admin/multas', { headers: { /* Auth Token */ } });
            // if (!response.ok) throw new Error(`Falha ao buscar multas: ${response.statusText}`);
            // const data = await response.json();
            // setMultas(data);

            // Dados de exemplo REMOVER QUANDO TIVER API-
            setMultas([
                { multaId: "M001", AluguerId: "ALG-123", clienteNome: "Joana Pereira", DataAtribuicao: "2025-04-10", DataLimite: "2025-04-20", Estado: "pendente", Contacto: "911222333", Valor: "120.00", ContestacaoId: "CST-01"},
                { multaId: "M002", AluguerId: "ALG-456", clienteNome: "Carlos Moreira", DataAtribuicao: "2025-03-01", DataPagamento: "2025-03-05", Estado: "paga", Contacto: "922333444", Valor: "85.50", ContestacaoId: null},
                { multaId: "M003", AluguerId: "ALG-789", clienteNome: "Ana Costa", DataAtribuicao: "2025-04-11", DataLimite: "2025-04-21", Estado: "pendente", Contacto: "933444555", Valor: "150.75", ContestacaoId: "CST-02"},
            ]);

        } catch (err) {
            console.error("Erro ao buscar multas:", err);
            setError(err.message || "Ocorreu um erro ao buscar as multas.");
            setMultas([]); // Limpa em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMultas();
    }, []);

    const filtered = !isLoading && !error ? multas.filter((multa) =>
        (multa.AluguerId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (multa.clienteNome?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (multa.multaId?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Modal Handlers ---
    const handleCloseModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewContestationModalOpen(false);
        setSelectedMulta(null);
        setContestationText("");
    };

    // Create
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCreateMulta = async (formData) => {
        console.log("[API Placeholder] Criar Multa:", formData);
        // LÓGICA DA API (POST /api/admin/multas) AQUI...
        // Se sucesso: await fetchMultas(); handleCloseModals();
        // Se erro: Mostrar feedback de erro
        handleCloseModals(); // Remover qd tiver API
    };

    // Edit
    const handleOpenEditModal = (multaId) => {
        const multaToEdit = multas.find(m => m.multaId === multaId);
        if (multaToEdit) {
            setSelectedMulta(multaToEdit);
            setIsEditModalOpen(true);
        } else {
            console.error("Multa não encontrada para editar:", multaId);
            alert("Erro: Multa não encontrada."); // Feedback básico
        }
    };
    const handleUpdateMulta = async (multaId, formData) => {
        console.log(`[API Placeholder] Atualizar Multa ID: ${multaId}`, formData);
        // LÓGICA DA API (PUT /api/admin/multas/{multaId}) AQUI...
        // Se sucesso: await fetchMultas(); handleCloseModals();
        // Se erro: Mostrar feedback de erro
        handleCloseModals(); // Remover qd tiver API
    };

    // View Contestation
    const handleOpenViewContestationModal = async (multa) => {
        if (!multa?.ContestacaoId) return;
        setIsFetchingContestation(true);
        setContestationText("");
        setIsViewContestationModalOpen(true);

        try {
            console.log(`[API Placeholder] Fetching contestation details for ID: ${multa.ContestacaoId}`);
            // SUBSTITUIR PELA CHAMADA API REAL (/api/admin/contestacoes/{ContestacaoId})
            await new Promise(resolve => setTimeout(resolve, 500));
            // const response = await fetch(`/api/admin/contestacoes/${multa.ContestacaoId}`, { headers: { /* Auth */ } });
            // if (!response.ok) throw new Error('Falha ao buscar contestação');
            // const data = await response.json();
            // setContestationText(data.texto); // Assumindo que API retorna { texto: "..." }

            setContestationText(`Texto simulado para contestação ${multa.ContestacaoId}. Detalhes...`); // Dados exemplo

        } catch (err) {
            console.error("Erro ao buscar contestação:", err);
            setContestationText("Erro ao carregar o texto da contestação.");
        } finally {
            setIsFetchingContestation(false);
        }
    };

    // --- Rendering Logic ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar multas...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro ao carregar multas: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhuma multa corresponde à pesquisa." : "Não existem multas registadas."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((multa) => (
                    <MultaCardAdmin
                        key={multa.multaId}
                        {...multa} // Passa todas as props da multa para o card
                        // Passa os handlers como props para o card poder chamar as funções da página
                        onEditClick={() => handleOpenEditModal(multa.multaId)}
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
                        placeholder="Pesquisar por ID multa/aluguer ou nome..."
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

            {/* Render Modals Conditionally */}
            <CreateMultaModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleCreateMulta} // Handler da página
            />

            {selectedMulta && (
                <EditMultaModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModals}
                    onSubmit={handleUpdateMulta} // Handler da página
                    multaData={selectedMulta} // Dados da multa selecionada
                />
            )}

            <ViewContestationModal
                isOpen={isViewContestationModalOpen}
                onClose={handleCloseModals}
                isLoading={isFetchingContestation} // Estado de loading do texto
                contestationText={contestationText} // Texto carregado (ou erro)
            />
        </>
    );
};

export default MultasPageAdmin;
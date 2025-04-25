import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PedidoAluguerCard from "../../components/Cards/pedidoAluguerCard.jsx"; // O nome do ficheiro mantém-se, mas o componente é adaptado
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import AluguerInfoModal from "../../components/Overlays/AluguerInfoModal.jsx";
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

const AlugueresPageAdmin = () => {
    const [alugueres, setAlugueres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAluguer, setSelectedAluguer] = useState(null);

    const fetchAlugueres = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Alugueres");
            setAlugueres(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erro ao buscar alugueres:", err);
            setError(err.message || "Ocorreu um erro ao buscar os alugueres.");
            setAlugueres([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAlugueres();
    }, []);

    const filtered = !isLoading && !error ? alugueres.filter((aluguer) => {
        const searchTerm = search.toLowerCase();
        const idMatch = (aluguer.idaluguer?.toString() || "").includes(searchTerm);
        const veiculoIdMatch = (aluguer.veiculoIdveiculo?.toString() || "").includes(searchTerm);
        const clienteIdMatch = (aluguer.clienteIdcliente?.toString() || "").includes(searchTerm);
        const estadoMatch = (aluguer.estadoAluguer?.toLowerCase() || "").includes(searchTerm);
        return idMatch || veiculoIdMatch || clienteIdMatch || estadoMatch;
    }) : [];

    const handleOpenDetailModal = (aluguer) => {
        setSelectedAluguer(aluguer);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAluguer(null);
    };

    // Funções handleApproveAluguer e handleRejectAluguer (manter/adaptar/remover se necessário)
    const handleApproveAluguer = async (aluguerId) => {
        console.log(`[API Placeholder] Aprovar Aluguer ID: ${aluguerId}`);
        // Lógica API aqui...
        // await fetchAlugueres(); // Re-fetch
        handleCloseDetailModal();
    };

    const handleRejectAluguer = async (aluguerId) => {
        console.log(`[API Placeholder] Rejeitar Aluguer ID: ${aluguerId}`);
        // Lógica API aqui...
        // await fetchAlugueres(); // Re-fetch
        handleCloseDetailModal();
    };

    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar alugueres...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhum aluguer corresponde à pesquisa." : "Não existem alugueres registados."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((aluguer) => (
                    <PedidoAluguerCard // Usando o mesmo componente, mas passando a prop 'aluguerData'
                        key={aluguer.idaluguer}
                        aluguerData={aluguer} // Passa o objeto completo do aluguer
                        onVerInfoClick={() => handleOpenDetailModal(aluguer)} // Passa a função de clique
                    />
                ))}
            </div>
        );
    }

    return (
        <>
            <DashboardLayout
                title="Alugueres Registados"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID Aluguer/Veículo/Cliente, Estado..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
            >
                {content}
            </DashboardLayout>

            {selectedAluguer && (
                <AluguerInfoModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    aluguerData={selectedAluguer}
                    onApprove={handleApproveAluguer}
                    onReject={handleRejectAluguer}
                />
            )}
        </>
    );
};

export default AlugueresPageAdmin;
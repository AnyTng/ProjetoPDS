import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PedidoAluguerCard from "../../components/Cards/pedidoAluguerCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import AluguerInfoModal from "../../components/Overlays/AluguerInfoModal.jsx"; // Assume que este modal também foi atualizado ou será
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

const AlugueresPageAdmin = () => {
    const [alugueres, setAlugueres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth();

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedAluguer, setSelectedAluguer] = useState(null);

    // Função para buscar dados do endpoint que retorna a estrutura nested
    const fetchAlugueres = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Certifique-se que este é o endpoint correto para a nova estrutura
            const data = await fetchWithAuth("/api/Alugueres/pesquisapedido");
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

    // Atualizar filtragem para pesquisar nos campos nested
    const filtered = !isLoading && !error ? alugueres.filter((aluguer) => {
        const searchTerm = search.toLowerCase();
        const idMatch = (aluguer.idaluguer?.toString() || "").includes(searchTerm);
        // Pesquisar no nome do cliente (nested)
        const clienteMatch = (aluguer.cliente?.nomeCliente?.toLowerCase() || "").includes(searchTerm);
        // Pesquisar na matrícula, marca ou modelo do veículo (nested)
        const veiculoMatch =
            (aluguer.veiculo?.matriculaVeiculo?.toLowerCase() || "").includes(searchTerm) ||
            (aluguer.veiculo?.marca?.toLowerCase() || "").includes(searchTerm) ||
            (aluguer.veiculo?.modelo?.toLowerCase() || "").includes(searchTerm);
        const estadoMatch = (aluguer.estadoAluguer?.toLowerCase() || "").includes(searchTerm);

        return idMatch || clienteMatch || veiculoMatch || estadoMatch;
    }) : [];

    const handleOpenDetailModal = (aluguer) => {
        setSelectedAluguer(aluguer);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedAluguer(null);
    };

    // Esta função será chamada pelo Modal após uma atualização bem-sucedida
    const handleStatusUpdate = () => {
        fetchAlugueres(); // Recarrega a lista
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
                    <PedidoAluguerCard
                        key={aluguer.idaluguer}
                        aluguerData={aluguer} // Passa o objeto completo
                        onVerInfoClick={() => handleOpenDetailModal(aluguer)}
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
                        placeholder="Pesquisar por ID, Cliente, Veículo, Estado..." // Atualizado
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
            >
                {content}
            </DashboardLayout>

            {/* Passar a função de callback para o Modal */}
            {selectedAluguer && (
                <AluguerInfoModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    aluguerData={selectedAluguer}
                    onStatusUpdate={handleStatusUpdate} // Passa a função para recarregar a lista
                    // Remover onApprove/onReject se não forem mais usados pelo modal atualizado
                />
            )}
        </>
    );
};

export default AlugueresPageAdmin;
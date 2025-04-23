import React, { useState, useEffect } from "react"; // Adicionar useEffect
import DashboardLayout from "../../components/dashboardLayout.jsx";
import PedidoAluguerCard from "../../components/Cards/pedidoAluguerCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import { useAuth } from "../../hooks/useAuth.js"; // Importar useAuth
// Importar o novo modal (será criado a seguir)
import PedidoDetailModal from "../../components/Overlays/PedidoDetailModal.jsx";
import { API_BASE_URL, fetchWithAuth } from "../../utils/api";

// Remover a prop 'pedidos'
const PedidosPageAdmin = () => {
    // Estados para dados, loading, erro
    const [pedidos, setPedidos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const { user } = useAuth(); // Obter user autenticado

    // Estados para o modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null); // Pedido a mostrar no modal

    // --- Fetch Inicial de Pedidos ---
    const fetchPedidos = async () => { // Tornar reutilizável
        setIsLoading(true);
        setError(null);
        try {
            // SUBSTITUIR '/api/admin/pedidos' PELO ENDPOINT REAL
            console.log("[API Placeholder] Fetching pedidos...");
            // Simulação - REMOVER/SUBSTITUIR
            await new Promise(resolve => setTimeout(resolve, 500));
            // const data = await fetchWithAuth('/api/admin/pedidos');
            // API deve retornar array de pedidos
            // // Garantir que os dados da API têm os campos necessários (id, userId, carroId, nome, status, startDate, endDate, value, imageUrl, etc.)
            // setPedidos(data);

            // Limpar dados mock - a página começará vazia ou com erro
            setPedidos([]); // Garante que fica vazio se a API não retornar nada

        } catch (err) {
            console.error("Erro ao buscar pedidos:", err);
            setError(err.message || "Ocorreu um erro ao buscar os pedidos.");
            setPedidos([]); // Limpar em caso de erro
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []); // Executa na montagem

    // Filtra pedidos baseado no estado local (vindo da API)
    const filtered = !isLoading && !error ? pedidos.filter((pedido) =>
        (pedido.carroId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (pedido.userId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (pedido.nome?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (pedido.status?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Handlers do Modal ---
    const handleOpenDetailModal = (pedido) => {
        // Idealmente, aqui poderíamos fazer outro fetch para buscar detalhes *completos*
        // se a lista inicial não tiver tudo (Valor Reserva, Data Pedido, etc.)
        // Por agora, passamos os dados que temos da lista.
        console.log("Abrindo detalhes para o pedido:", pedido?.id);
        setSelectedPedido(pedido);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedPedido(null);
    };

    const handleApprovePedido = async (pedidoId) => {
        console.log(`[API Placeholder] Aprovar Pedido ID: ${pedidoId}`);
        // LÓGICA DA API (PUT/POST /api/admin/pedidos/{pedidoId}/approve) AQUI...
        // try {
        //    await fetchWithAuth(`/api/admin/pedidos/${pedidoId}/approve`, { method: 'POST' });
        //    await fetchPedidos(); // Re-fetch list on success
        //    handleCloseDetailModal();
        // } catch (err) { console.error("Erro ao aprovar pedido:", err); /* Show error */ }
        handleCloseDetailModal(); // Fechar modal (remover qd tiver API)
    };

    const handleRejectPedido = async (pedidoId) => {
        console.log(`[API Placeholder] Rejeitar Pedido ID: ${pedidoId}`);
        // LÓGICA DA API (PUT/POST /api/admin/pedidos/{pedidoId}/reject) AQUI...
        // try {
        //    await fetchWithAuth(`/api/admin/pedidos/${pedidoId}/reject`, { method: 'POST' });
        //    await fetchPedidos(); // Re-fetch list on success
        //    handleCloseDetailModal();
        // } catch (err) { console.error("Erro ao rejeitar pedido:", err); /* Show error */ }
        handleCloseDetailModal(); // Fechar modal (remover qd tiver API)
    };
    // --- Fim Handlers ---

    // --- Lógica de Renderização Condicional ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar pedidos...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhum pedido corresponde à pesquisa." : "Não existem pedidos registados."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((pedido) => (
                    <PedidoAluguerCard
                        key={pedido.id} // Usar um ID único vindo da API
                        // Passar props baseadas nos dados da API
                        userId={pedido.userId}
                        carroId={pedido.carroId}
                        nome={pedido.nome}
                        status={pedido.status}
                        startDate={pedido.startDate}
                        endDate={pedido.endDate}
                        value={pedido.value}
                        imageUrl={pedido.imageUrl}
                        // Passar a função para abrir o modal de detalhes
                        onVerInfoClick={() => handleOpenDetailModal(pedido)}
                    />
                ))}
            </div>
        );
    }
    // --- Fim Lógica Renderização ---

    return (
        <>
            <DashboardLayout
                title="Pedidos e Alugueres"
                email={user?.email} // Usa email do user autenticado
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID carro/cliente, nome ou estado..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
                // Sem botão flutuante nesta página por agora
            >
                {content} {/* Renderiza o conteúdo dinâmico */}
            </DashboardLayout>

            {/* Renderizar Modal de Detalhes Condicionalmente */}
            {selectedPedido && ( // Renderiza só se houver um pedido selecionado
                <PedidoDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    pedidoData={selectedPedido} // Passa os dados do pedido selecionado
                    onApprove={handleApprovePedido} // Passa a função de aprovar
                    onReject={handleRejectPedido}   // Passa a função de rejeitar
                />
            )}
        </>
    );
};

export default PedidosPageAdmin;

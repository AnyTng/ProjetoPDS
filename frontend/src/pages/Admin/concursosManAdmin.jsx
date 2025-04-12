import React, { useState, useEffect } from "react"; // Importar useEffect
import DashboardLayout from "../../components/dashboardLayout.jsx";
import ConcursosManutencaoAdminCard from "../../components/Cards/concursosManutencaoAdminCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import CreateConcursoModal from "../../components/Overlays/CreateConcursoModal.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const ConcursosManAdmin = () => {
    const [search, setSearch] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [pedidos, setPedidos] = useState([]); // 1. Começa vazio, sem mocks
    const [isLoading, setIsLoading] = useState(true); // 2. Estado de Loading
    const [error, setError] = useState(null); // 3. Estado de Erro
    const { user } = useAuth();

    // 4. useEffect para buscar dados da API
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        // SUBSTITUI '/api/admin/concursos' PELO TEU ENDPOINT REAL
        fetch('/api/admin/concursos')
            .then(response => {
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new TypeError("A resposta recebida não é JSON!");
                }
                return response.json();
            })
            .then(data => {
                // Assumindo que a API retorna um array de 'pedidos' (concursos)
                setPedidos(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar concursos:", err);
                setError(err.message || "Ocorreu um erro ao buscar os concursos.");
                setIsLoading(false);
            });
    }, []); // Array vazio para correr só na montagem

    // --- Handlers ---
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => setIsCreateModalOpen(false);

    // Placeholder para criar concurso (chamado pelo modal)
    const handleCreateConcurso = (concursoData) => {
        console.log("--- Criar Novo Concurso (Placeholder) ---");
        console.log("Dados recebidos:", concursoData);
        // Lógica API (POST) aqui...
        // Exemplo: fetch('/api/admin/concursos', { method: 'POST', body: JSON.stringify(concursoData), headers: {'Content-Type': 'application/json'} })
        //           .then(response => response.json())
        //           .then(newConcurso => {
        //               setPedidos(prev => [newConcurso, ...prev]); // Adiciona à lista se API retornar o objeto criado
        //           })
        //           .catch(err => console.error("Erro ao criar concurso:", err));
        handleCloseCreateModal(); // Fecha o modal
    };
    // --- Fim Handlers ---

    // Filtra APENAS se não estiver loading e não houver erro
    const filtered = !isLoading && !error ? pedidos.filter((pedido) =>
        (pedido.carroId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (pedido.TipoManutencao?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Lógica de Renderização Condicional ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar concursos...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhum concurso corresponde à pesquisa." : "Não existem concursos registados."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((pedido) => (
                    <ConcursosManutencaoAdminCard
                        key={pedido.concursoId} // Usa um ID único vindo da API
                        // Passa as props necessárias para o Card a partir do objeto 'pedido'
                        concursoId={pedido.concursoId}
                        carroId={pedido.carroId}
                        carroNome={pedido.carroNome}
                        estado={pedido.estado}
                        TipoManutencao={pedido.TipoManutencao}
                        valor={pedido.valor}
                        imageUrl={pedido.imageUrl}
                    />
                ))}
            </div>
        );
    }
    // --- Fim Lógica Renderização ---

    return (
        <>
            <DashboardLayout
                title="Concursos e Manutenções"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID carro ou manutenção..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Novo Concurso"
                        onClick={handleOpenCreateModal} // Chama a função correta
                    />
                }
            >
                {content} {/* Renderiza o conteúdo */}
            </DashboardLayout>

            {/* Modal de Criação */}
            <CreateConcursoModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onSubmit={handleCreateConcurso}
            />
        </>
    );
};

export default ConcursosManAdmin;
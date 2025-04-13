import React, { useState, useEffect } from "react"; // Adicionar useEffect
import DashboardLayout from "../../components/dashboardLayout.jsx";
import VeiculoCard from "../../components/Cards/veiculoCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import AddVehicleModal from "../../components/Overlays/AddVehicleModal.jsx";
import EditVehicleModal from "../../components/Overlays/EditVehicleModal.jsx";
import { useAuth } from "../../hooks/useAuth.js";

const CarsPageAdmin = () => {
    const [carros, setCarros] = useState([]); // Começa como array vazio
    const [isLoading, setIsLoading] = useState(true); // Estado para loading
    const [error, setError] = useState(null); // Estado para erros de fetch
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const { user } = useAuth();

    // --- Fetch Inicial de Veículos ---
    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // SUBSTITUIR '/api/admin/veiculos' PELO ENDPOINT REAL
                console.log("[API Placeholder] Fetching vehicles...");
                // Simulação de fetch - REMOVER/SUBSTITUIR ISTO
                await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede
                // const response = await fetch('/api/admin/veiculos');
                // if (!response.ok) throw new Error('Falha ao buscar veículos');
                // const data = await response.json();
                // setCarros(data); // <<== Definir o estado com dados da API
                setCarros([]); // <<== Manter vazio por agora até ter API real

            } catch (err) {
                console.error("Erro ao buscar veículos:", err);
                setError(err.message || "Ocorreu um erro ao buscar os veículos.");
                setCarros([]); // Limpa carros em caso de erro
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicles();
    }, []); // Executa apenas na montagem inicial

    // Filtra os carros baseado no estado atual (vindo da API ou vazio)
    const filtered = !isLoading && !error ? carros.filter((carro) =>
        (carro.CarroId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (carro.CarroNome?.toLowerCase() || "").includes(search.toLowerCase())
    ) : [];

    // --- Funções Handler para Modais ---
    const handleOpenAddModal = () => setIsAddModalOpen(true);

    const handleOpenEditModal = (carroId) => {
        const vehicleToEdit = carros.find(carro => carro.CarroId === carroId);
        if (vehicleToEdit) {
            setSelectedVehicle(vehicleToEdit);
            setIsEditModalOpen(true);
        } else {
            console.error("Veículo não encontrado para o ID:", carroId);
            // Poderia mostrar uma notificação de erro para o user aqui
        }
    };

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedVehicle(null);
    };

    // --- Funções Handler CRUD (APENAS placeholders API) ---
    const handleAddVehicle = (vehicleData, vehicleFile) => {
        console.log("[API Placeholder] Adicionar Veículo:", vehicleData, vehicleFile?.name);
        // LÓGICA DA API (POST com FormData) AQUI
        // fetch('/api/admin/veiculos', { method: 'POST', body: formDataComFicheiro })
        //   .then(response => { if (!response.ok) throw Error... return response.json()})
        //   .then(novoVeiculo => {
        //      console.log("Veículo adicionado:", novoVeiculo);
        //      // Idealmente, re-fetches a lista ou adiciona SÓ se a API retornar sucesso
        //      // Ex: fetchVehicles(); // Re-buscar lista completa
        //   })
        //   .catch(err => console.error("Erro ao adicionar veículo:", err));

        handleCloseModals(); // Fecha o modal independentemente do resultado por agora
        // Poderia fechar apenas em caso de sucesso
    };

    const handleUpdateVehicle = (vehicleId, updatedData, newFile) => {
        console.log(`[API Placeholder] Atualizar Veículo ID: ${vehicleId}`, updatedData, newFile?.name);
        // LÓGICA DA API (PUT com FormData se houver newFile) AQUI
        // fetch(`/api/admin/veiculos/${vehicleId}`, { method: 'PUT', body: formDataAtualizado })
        //   .then(...)
        //   .then(veiculoAtualizado => {
        //       console.log("Veículo atualizado:", veiculoAtualizado);
        //       // Ex: fetchVehicles(); // Re-buscar lista
        //   })
        //   .catch(...)

        handleCloseModals();
    };

    const handleDeleteVehicle = (vehicleId) => {
        console.log(`[API Placeholder] Apagar Veículo ID: ${vehicleId}`);
        // LÓGICA DA API (DELETE) AQUI
        // fetch(`/api/admin/veiculos/${vehicleId}`, { method: 'DELETE' })
        //   .then(response => {
        //       if (!response.ok) throw new Error('Falha ao apagar');
        //       console.log("Veículo apagado com sucesso");
        //       // Ex: fetchVehicles(); // Re-buscar lista
        //   })
        //   .catch(...)

        handleCloseModals(); // Fecha modal de edição (assumindo que veio dele)
    };
    // --- Fim das Funções Handler ---

    // --- Renderização Condicional do Conteúdo ---
    let content;
    if (isLoading) {
        content = <div className="p-6 text-center text-gray-500">A carregar veículos...</div>;
    } else if (error) {
        content = <div className="p-6 text-center text-red-600">Erro: {error}</div>;
    } else if (filtered.length === 0) {
        content = (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600 text-lg text-center">
                    {search ? "Nenhum veículo corresponde à pesquisa." : "Não existem veículos registados."}
                </p>
            </div>
        );
    } else {
        content = (
            <div className="flex flex-col gap-6 pb-6">
                {filtered.map((carro) => (
                    <VeiculoCard
                        key={carro.CarroId}
                        // Passa as props necessárias baseadas nos dados REAIS (vindos da API)
                        CarroId={carro.CarroId}
                        CarroNome={carro.CarroNome} // Ajustar nomes das props se necessário
                        UltimaManutencao={carro.UltimaManutencao}
                        Estado={carro.Estado}
                        imageUrl={carro.imageUrl} // Ajustar nome da prop da imagem se necessário
                        onVerInfoClick={() => handleOpenEditModal(carro.CarroId)}
                    />
                ))}
            </div>
        );
    }
    // --- Fim da Renderização Condicional ---

    return (
        <>
            <DashboardLayout
                title="Veículos"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar veículos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error} // Desativa filtro durante loading/erro
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Novo veículo"
                        onClick={handleOpenAddModal}
                        disabled={isLoading || !!error} // Desativa botão durante loading/erro
                    />
                }
            >
                {content} {/* Renderiza o conteúdo (loading, erro, lista ou vazio) */}
            </DashboardLayout>

            {/* Modais são renderizados fora do Layout principal para sobrepor */}
            <AddVehicleModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleAddVehicle} // Passa a função que só chama a API (placeholder)
            />

            {selectedVehicle && (
                <EditVehicleModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModals}
                    vehicleData={selectedVehicle} // Dados vêm do estado que foi populado pela lista da API
                    onUpdate={handleUpdateVehicle} // Passa a função que só chama a API (placeholder)
                    onDelete={handleDeleteVehicle} // Passa a função que só chama a API (placeholder)
                />
            )}
        </>
    );
};

export default CarsPageAdmin;
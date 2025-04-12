import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import VeiculoCard from "../../components/Cards/veiculoCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import AddVehicleModal from "../../components/Overlays/AddVehicleModal.jsx"; // Importar modal de Adição
import EditVehicleModal from "../../components/Overlays/EditVehicleModal.jsx"; // Importar modal de Edição
import { useAuth } from "../../hooks/useAuth.js"; // Importar useAuth para obter user



const CarsPageAdmin = (/* { carros = [], email = "admin@email.com" } */) => {

    const [carros, setCarros] = useState([]);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);   // Estado para modal Adicionar
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);  // Estado para modal Editar
    const [selectedVehicle, setSelectedVehicle] = useState(null); // Estado para dados do carro     a editar
    const { user } = useAuth(); // Obter user autenticado

    // Filtra os carros (agora baseado no estado local 'carros')
    const filtered = carros.filter((carro) =>
        (carro.CarroId?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (carro.CarroNome?.toLowerCase() || "").includes(search.toLowerCase())
    );

    // --- Funções Handler para os Modais ---
    const handleOpenAddModal = () => setIsAddModalOpen(true);


    const handleOpenEditModal = (carroId) => {
        // Log 1: Verificar se a função é chamada e com qual ID
        console.log("Tentando abrir modal de edição para ID:", carroId);

        // Log 2: Verificar o conteúdo do array 'carros' onde estamos a procurar
        console.log("A procurar em:", carros);

        const vehicleToEdit = carros.find(carro => carro.CarroId === carroId);

        // Log 3: Verificar se o veículo foi encontrado
        console.log("Veículo encontrado:", vehicleToEdit);

        if (vehicleToEdit) {
            setSelectedVehicle(vehicleToEdit);
            setIsEditModalOpen(true);
            // Log 4: Confirmar que os estados foram atualizados (isto pode não aparecer imediatamente antes da re-renderização)
            console.log("Estados selectedVehicle e isEditModalOpen deverão ser atualizados.");
        } else {
            // Log 5: Indicar claramente se o veículo não foi encontrado
            console.error("Veículo não encontrado para o ID:", carroId);
        }
    };

    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedVehicle(null);
    };

    // Placeholders - A lógica da API virá aqui depois
    const handleAddVehicle = (vehicleData, vehicleFile) => {
        console.log("[Placeholder] Adicionar Veículo:", vehicleData, vehicleFile?.name);
        // Simular adição à lista mock (para ver o resultado sem refresh)
        const newCarMock = { ...vehicleData, CarroId: `NEW-${Date.now()}`, CarroNome: `${vehicleData.marca} ${vehicleData.modelo}`, Estado: vehicleData.estadoVeiculo, imageUrl: vehicleFile ? URL.createObjectURL(vehicleFile) : null };
        setCarros(prev => [newCarMock, ...prev]);
        handleCloseModals();
    };

    const handleUpdateVehicle = (vehicleId, updatedData, newFile) => {
        console.log(`[Placeholder] Atualizar Veículo ID: ${vehicleId}`, updatedData, newFile?.name);
        // Simular atualização na lista mock
        setCarros(prev => prev.map(c => c.CarroId === vehicleId ? { ...c, ...updatedData, CarroNome: `${updatedData.marca} ${updatedData.modelo}`, Estado: updatedData.estadoVeiculo, imageUrl: newFile ? URL.createObjectURL(newFile) : c.imageUrl } : c));
        handleCloseModals();
    };

    const handleDeleteVehicle = (vehicleId) => {
        console.log(`[Placeholder] Apagar Veículo ID: ${vehicleId}`);
        // Simular remoção da lista mock
        setCarros(prev => prev.filter(c => c.CarroId !== vehicleId));
        handleCloseModals();
    };
    // --- Fim das Funções Handler ---

    return (
        // Fragmento para permitir renderizar Layout e Modais
        <>
            <DashboardLayout
                title="Veículos"
                email={user?.email} // Usa o email do user autenticado
                filter={
                    <FilterInput
                        placeholder="Pesquisar veículos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Novo veículo"
                        onClick={handleOpenAddModal} // Chama a função para abrir modal de adição
                    />
                }
            >
                {/* Lógica de renderização da lista (igual à original, mas usa 'filtered' do estado local) */}
                {filtered.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-600 text-lg text-center">
                            {search ? "Nenhum veículo corresponde à pesquisa." : "Não existem veículos."}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 pb-6">
                        {filtered.map((carro) => (
                            <VeiculoCard
                                key={carro.CarroId}
                                CarroId={carro.CarroId}
                                CarroNome={carro.CarroNome}
                                UltimaManutencao={carro.UltimaManutencao}
                                Estado={carro.Estado}
                                imageUrl={carro.imageUrl}
                                // Passa a função para abrir o modal de edição
                                onVerInfoClick={() => handleOpenEditModal(carro.CarroId)}
                            />
                        ))}
                    </div>
                )}
            </DashboardLayout>

            {/* Renderização Condicional dos Modais */}
            <AddVehicleModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModals}
                onSubmit={handleAddVehicle}
            />

            {selectedVehicle && (
                <EditVehicleModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModals}
                    vehicleData={selectedVehicle}
                    onUpdate={handleUpdateVehicle}
                    onDelete={handleDeleteVehicle}
                />
            )}
        </>
    );
};

export default CarsPageAdmin;
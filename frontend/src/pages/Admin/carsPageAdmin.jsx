// srcFrontend/pages/Admin/carsPageAdmin.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import VeiculoCard from "../../components/Cards/veiculoCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";
import AddVehicleModal from "../../components/Overlays/AddVehicleModal.jsx";
import EditVehicleModal from "../../components/Overlays/EditVehicleModal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { fetchWithAuth } from "../../utils/api"; // IMPORTAR

const CarsPageAdmin = () => {
    const [carros, setCarros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const { user } = useAuth();

    // --- Fetch Inicial de Veículos ---
    const fetchVehicles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Fetching vehicles...");
            // USA fetchWithAuth
            const data = await fetchWithAuth('/api/Veiculos'); // Endpoint real
            setCarros(data || []); // Garante que é um array mesmo se a API retornar null
        } catch (err) {
            console.error("Erro ao buscar veículos:", err);
            setError(err.message || "Ocorreu um erro ao buscar os veículos.");
            setCarros([]);
            // Poderia tratar 401/403 aqui e deslogar o user se necessário
            // if (err.status === 401 || err.status === 403) { logout(); navigate('/login'); }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependência vazia para executar apenas na montagem

    // Filtra os carros
    const filtered = !isLoading && !error ? carros.filter((carro) =>
        // Adapta as chaves se necessário (ex: carro.matriculaVeiculo)
        (carro.idveiculo?.toString().toLowerCase() || "").includes(search.toLowerCase()) ||
        (carro.matriculaVeiculo?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (carro.modeloVeiculoIdmodeloNavigation?.marcaVeiculoIdmarcaNavigation?.descMarca?.toLowerCase() || "").includes(search.toLowerCase()) || // Marca
        (carro.modeloVeiculoIdmodeloNavigation?.descModelo?.toLowerCase() || "").includes(search.toLowerCase()) // Modelo
    ) : [];


    // --- Funções Handler para Modais ---
    const handleOpenAddModal = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (carroId) => {
        const vehicleToEdit = carros.find(carro => carro.idveiculo === carroId); // Ajusta chave primária se for idveiculo
        if (vehicleToEdit) {
            setSelectedVehicle(vehicleToEdit);
            setIsEditModalOpen(true);
        } else {
            console.error("Veículo não encontrado para o ID:", carroId);
            alert("Erro: Veículo não encontrado.");
        }
    };
    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedVehicle(null);
    };

    // --- Funções Handler CRUD ---
    const handleAddVehicle = async (vehicleData, vehicleFile) => {
        console.log("Tentando adicionar veículo:", vehicleData, vehicleFile?.name);
        const formDataToSend = new FormData();

        // Adiciona campos de texto/número/etc.
        Object.keys(vehicleData).forEach(key => {
            // Trata valores null/undefined para não enviar 'null'/'undefined' como strings
            if (vehicleData[key] !== null && vehicleData[key] !== undefined) {
                formDataToSend.append(key, vehicleData[key]);
            }
        });

        // Adiciona o ficheiro se existir
        if (vehicleFile) {
            // O nome 'fotoVeiculo' deve corresponder ao esperado pelo backend para IFormFile
            formDataToSend.append('fotoVeiculo', vehicleFile, vehicleFile.name);
        }

        try {
            // Usa fetchWithAuth para POST com FormData
            // Não precisas de definir Content-Type, fetchWithAuth tratará disso
            const novoVeiculo = await fetchWithAuth('/api/Veiculos', { // Endpoint POST
                method: 'POST',
                body: formDataToSend // Passa FormData diretamente
            });
            console.log("Veículo adicionado:", novoVeiculo);
            await fetchVehicles(); // Re-busca a lista para atualizar
            handleCloseModals();
            alert('Veículo adicionado com sucesso!');
        } catch (err) {
            console.error("Erro ao adicionar veículo:", err);
            alert(`Erro ao adicionar veículo: ${err.message}`);
        }
    };


    const handleUpdateVehicle = async (formData) => {
          try {
                await fetchWithAuth('/api/Veiculos/edit', {
                      method: 'PUT',
                      body: formData            // já vem pronto do modal
              });
                await fetchVehicles();
                handleCloseModals();
                alert('Veículo atualizado com sucesso!');
              } catch (err) {
                console.error(err);
                alert(`Erro ao atualizar veículo: ${err.message}`);
              }
        };

    const handleDeleteVehicle = async (vehicleId) => {
        console.log(`Tentando apagar veículo ID: ${vehicleId}`);
        // Confirmação já está no EditModal, mas pode adicionar outra aqui se quiser
        try {
            // Usa fetchWithAuth para DELETE
            await fetchWithAuth(`/api/Veiculos/${vehicleId}`, {
                method: 'DELETE'
            });
            console.log("Veículo apagado com sucesso.");
            await fetchVehicles(); // Re-buscar lista
            handleCloseModals(); // Fecha o modal de edição
            alert('Veículo apagado com sucesso.');
        } catch (err) {
            console.error("Erro ao apagar veículo:", err);
            alert(`Erro ao apagar veículo: ${err.message}`);
        }
    };

    // --- Renderização Condicional ---
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6"> {/* Grid para melhor responsividade */}
                {filtered.map((carro) => (
                    <VeiculoCard
                        key={carro.idveiculo}
                        CarroId={carro.matriculaVeiculo || `ID: ${carro.idveiculo}`}
                        CarroNome={`${carro.descMarca} ${carro.descModelo}`.trim()}   // ← aqui
                        UltimaManutencao={carro.dataUltimaManutencao || "N/D"}
                        Estado={carro.estadoVeiculo || "Desconhecido"}
                        imageUrl={carro.imagemBase64|| ("")}
                        onVerInfoClick={() => handleOpenEditModal(carro.idveiculo)}
                    />
                ))}
            </div>
        );
    }
    // --- Fim da Renderização ---

    return (
        <>
            <DashboardLayout
                title="Veículos"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar por ID, Matrícula, Marca, Modelo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isLoading || !!error}
                    />
                }
                floatingAction={
                    <FloatingButton
                        type="add"
                        text="Novo veículo"
                        onClick={handleOpenAddModal}
                        disabled={isLoading || !!error}
                    />
                }
            >
                {content}
            </DashboardLayout>

            {/* Modais */}
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
// src/pages/Admin/carsPageAdmin.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout     from "../../components/dashboardLayout.jsx";
import VeiculoCard         from "../../components/Cards/veiculoCard.jsx";
import FilterInput         from "../../components/filterInput.jsx";
import FloatingButton      from "../../components/floatingButton.jsx";
import AddVehicleModal     from "../../components/Overlays/AddVehicleModal.jsx";
import EditVehicleModal    from "../../components/Overlays/EditVehicleModal.jsx";
import { useAuth }         from "../../hooks/useAuth.js";
import { fetchWithAuth }   from "../../utils/api";

const CarsPageAdmin = () => {
    /* ------------------------ STATE ------------------------ */
    const [carros,           setCarros]           = useState([]);
    const [isLoading,        setIsLoading]        = useState(true);
    const [error,            setError]            = useState(null);
    const [search,           setSearch]           = useState("");
    const [isAddModalOpen,   setIsAddModalOpen]   = useState(false);
    const [isEditModalOpen,  setIsEditModalOpen]  = useState(false);
    const [selectedVehicle,  setSelectedVehicle]  = useState(null);
    const { user } = useAuth();

    /* ---------------------- FETCH LIST --------------------- */
    const fetchVehicles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth("/api/Veiculos");
            setCarros(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError(err.message || "Erro ao buscar os veículos.");
            setCarros([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    /* -------------------- FILTRO DE PESQUISA -------------------- */
    const filtered = !isLoading && !error
        ? carros.filter(c => {
            const idMatch       = (c.idveiculo?.toString() || "").toLowerCase().includes(search.toLowerCase());
            const matMatch      = (c.matriculaVeiculo       || "").toLowerCase().includes(search.toLowerCase());
            const marcaMatch    = (c.descMarca              || "").toLowerCase().includes(search.toLowerCase());
            const modeloMatch   = (c.descModelo             || "").toLowerCase().includes(search.toLowerCase());
            const combinedMatch = `${c.descMarca || ""} ${c.descModelo || ""}`.toLowerCase().includes(search.toLowerCase());

            return idMatch || matMatch || marcaMatch || modeloMatch || combinedMatch;
        })
        : [];

    /* ------------------------ MODAIS ------------------------ */
    const handleOpenAddModal  = () => setIsAddModalOpen(true);
    const handleOpenEditModal = (id) => {
        const v = carros.find(c => c.idveiculo === id);
        if (v) { setSelectedVehicle(v); setIsEditModalOpen(true); }
        else    alert("Veículo não encontrado.");
    };
    const handleCloseModals = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedVehicle(null);
    };

    /* ------------------------- CRUD ------------------------- */
    /** ADICIONAR **/
    const handleAddVehicle = async (formData) => {
        try {
            await fetchWithAuth("/api/Veiculos", { method: "POST", body: formData });
            await fetchVehicles();
            handleCloseModals();
            alert("Veículo adicionado com sucesso!");
        } catch (err) {
            console.error(err);
            alert(`Erro ao adicionar veículo: ${err.message}`);
        }
    };

    /** EDITAR **/
    const handleUpdateVehicle = async (formData) => {
        try {
            await fetchWithAuth("/api/Veiculos/edit", { method: "PUT", body: formData });
            await fetchVehicles();
            handleCloseModals();
            alert("Veículo atualizado com sucesso!");
        } catch (err) {
            console.error(err);
            alert(`Erro ao atualizar veículo: ${err.message}`);
        }
    };



    /* -------------------- RENDERIZAÇÃO -------------------- */
    let content;
    if (isLoading)       content = <p className="p-6 text-center">A carregar veículos…</p>;
    else if (error)      content = <p className="p-6 text-center text-red-600">{error}</p>;
    else if (!filtered.length)
        content = <p className="p-6 text-center text-gray-600">
            {search ? "Nenhum resultado." : "Não existem veículos registados."}
        </p>;
    else
        content = (
            <div className="grid lg:grid-cols-2 gap-6 pb-6">
                {filtered.map(c => (
                    <VeiculoCard
                        key={c.idveiculo}
                        CarroId={c.matriculaVeiculo || `ID ${c.idveiculo}`}
                        CarroNome={`${c.descMarca} ${c.descModelo}`.trim()}
                        ultimaMod = {c.ultimaMod ? new Date(c.ultimaMod).toISOString().slice(0, 10) : "Nenhuma"}
                        Estado={c.estadoVeiculo || "Desconhecido"}
                        imageUrl={c.imagemBase64 || ""}
                        onVerInfoClick={() => handleOpenEditModal(c.idveiculo)}
                    />
                ))}
            </div>
        );

    return (
        <>
            <DashboardLayout
                title="Veículos"
                email={user?.email}
                filter={
                    <FilterInput
                        placeholder="Pesquisar ID, Matrícula, Marca, Modelo…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
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

            {/* ---------- MODAIS ---------- */}
            <AddVehicleModal
                isOpen  ={isAddModalOpen}
                onClose ={handleCloseModals}
                onSubmit={handleAddVehicle}
            />

            {selectedVehicle && (
                <EditVehicleModal
                    isOpen    ={isEditModalOpen}
                    onClose   ={handleCloseModals}
                    vehicleData={selectedVehicle}
                    onUpdate  ={handleUpdateVehicle}
                />
            )}
        </>
    );
};

export default CarsPageAdmin;
import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import VeiculoCard from "../../components/Cards/veiculoCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";

const CarsPageAdmin = ({ carros = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = carros.filter((carro) =>
        (carro.CarroId || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Veículos"
            email={email}
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
                    onClick={() => console.log("Clicado no botão flutuante: criar novo veículo")}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhum veículo corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {filtered.map((carro) => (
                        <VeiculoCard
                            key={carro.CarroId}
                            CarroId={carro.CarroId}
                            CarroNome={carro.CarroNome}
                            UltimaManutencao={carro.UltimaManutencao}
                            Estado={carro.Estado}
                            imageUrl={carro.imageUrl}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default CarsPageAdmin;
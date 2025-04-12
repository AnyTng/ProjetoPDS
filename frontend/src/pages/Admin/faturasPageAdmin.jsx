import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import FaturaCard from "../../components/Cards/faturaCard.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx";

const FaturasPageAdmin = ({ faturas = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = faturas.filter((fatura) =>
        (fatura.carId || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Faturas"
            email={email}
            filter={
                <FilterInput
                    placeholder="Pesquisar por ID do carro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            }
            floatingAction={
                <FloatingButton
                    type="upload"
                    text="Enviar Fatura"
                    onClick={() => console.log("Clicado botão flutuante: enviar fatura")}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhuma fatura corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((fatura) => (
                    <FaturaCard
                        key={fatura.faturaId}
                        Type={fatura.type}
                        CarId={fatura.carId}
                        Valor={fatura.valor}
                        FaturaId={fatura.faturaId}
                        Data={fatura.data}
                        UserId={fatura.userId}
                        Servico={fatura.servico}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default FaturasPageAdmin;
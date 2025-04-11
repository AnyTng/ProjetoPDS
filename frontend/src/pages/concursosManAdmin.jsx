import React, { useState } from "react";
import DashboardLayout from "../components/dashboardLayout";
import ConcursosManutencaoAdminCard from "../components/concursosManutencaoAdminCard.jsx";
import FilterInput from "../components/filterInput";
import FloatingButton from "../components/floatingButton"; // 👈 Importação correta

const ConcursosManAdmin = ({ pedidos = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = pedidos.filter((pedido) =>
        pedido.carroId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Concursos e Manutenções"
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
                    type="add"
                    text="Novo Concurso"
                    onClick={() => console.log("Clicado botão flutuante: criar novo concurso")}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhum concurso corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((pedido) => (
                    <ConcursosManutencaoAdminCard
                        key={pedido.concursoId}
                        carroId={pedido.carroId}
                        carroNome={pedido.carroNome}
                        estado={pedido.estado}
                        TipoManutencao={pedido.TipoManutencao}
                        valor={pedido.valor}
                        imageUrl={pedido.imageUrl}
                        concursoId={pedido.concursoId}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default ConcursosManAdmin;
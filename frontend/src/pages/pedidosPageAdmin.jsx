import React, { useState } from "react";
import DashboardLayout from "../components/dashboardLayout";
import PedidoAluguerCard from "../components/pedidoAluguerCard.jsx";
import FilterInput from "../components/filterInput";

const PedidosPageAdmin = ({ pedidos = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = pedidos.filter((pedido) =>
        pedido.carroId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Pedidos e alugueres"
            email={email}
            filter={
                <FilterInput
                    placeholder="Pesquisar por ID do carro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhum pedido corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((pedido) => (
                    <PedidoAluguerCard
                        key={pedido.id}
                        userId={pedido.userId}
                        carroId={pedido.carroId}
                        nome={pedido.nome}
                        status={pedido.status}
                        startDate={pedido.startDate}
                        endDate={pedido.endDate}
                        value={pedido.value}
                        imageUrl={pedido.imageUrl}
                        onVerInfoClick={() => console.log("Ver info do pedido:", pedido.id)} // TEMOS DE MUDAR ISTOOOO AAAAA PARA IMPLEMENTAR A FUNÇÃO DEPOIS
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default PedidosPageAdmin;
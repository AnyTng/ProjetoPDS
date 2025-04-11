import React, { useState } from "react";
import DashboardLayout from "../components/dashboardLayout";
import PropostaCardAdmin from "../components/propostaCardAdmin.jsx";
import FilterInput from "../components/filterInput";
import FloatingButton from "../components/floatingButton.jsx";

const PropostasPageAdmin = ({ pedidos = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = pedidos.filter((pedido) =>
        pedido.carroId.toLowerCase().includes(search.toLowerCase())
    );

    const handleAceitar = (id) => {
        console.log(`API CALL → Aceitar proposta ${id}`);
        // Alalal fazer a chamada da API aqui
    };

    const handleRejeitar = (id) => {
        console.log(`API CALL → Rejeitar proposta ${id}`);
        // lalalala fazer a chamada da API aqui
    };

    return (
        <DashboardLayout
            title="Propostas"
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
                    type="remove"
                    text="Terminar e cancelar concurso"
                    onClick={() =>
                        console.log("Clicado botão flutuante: cancelar concurso")
                    }
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhuma proposta corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((proposta) => (
                    <PropostaCardAdmin
                        key={proposta.id}
                        CarroId={proposta.carroId}
                        CarroNome={proposta.carroNome}
                        EmpresaNome={proposta.empresa}
                        Data={proposta.data}
                        Valor={proposta.valor}
                        TipoManutencao={proposta.TipoManutencao}
                        onAceitar={() => handleAceitar(proposta.id)}
                        onRejeitar={() => handleRejeitar(proposta.id)}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default PropostasPageAdmin;
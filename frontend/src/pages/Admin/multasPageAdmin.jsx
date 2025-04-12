import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import MultaCardAdmin from "../../components/Cards/multaCardAdmin.jsx";
import FilterInput from "../../components/filterInput.jsx";
import FloatingButton from "../../components/floatingButton.jsx"; // 👈 Importação correta

const MultasPageAdmin = ({ multas = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = multas.filter((multa) =>
        multa.aluguerId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Multas"
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
                    text="Nova Multa"
                    onClick={() => console.log("Clicado botão flutuante: criar novo concurso")}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhuma multa corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((multa) => (
                    <MultaCardAdmin
                        key={multa.multaId}
                        AluguerId={multa.aluguerId}
                        ClienteNome={multa.clienteNome}
                        Contacto={multa.contacto}
                        Estado={multa.estado}
                        Valor={multa.valor}
                        DataAtribuicao={multa.dataAtribuicao}
                        DataLimite={multa.dataLimite}
                        DataPagamento={multa.dataPagamento}
                        ContestacaoId={multa.contestacaoId}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default MultasPageAdmin;
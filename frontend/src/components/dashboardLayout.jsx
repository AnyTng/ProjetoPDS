import React from "react";
import Header from "./header"; // já existente

const DashboardLayout = ({ title, filter, actions, children }) => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <Header userType="Admin" email="email@email.com" /> {/* Exemplo, ajuste conforme necessário */}

            <main className="px-10 py-8">
                {/* Linha superior com título e filtro (MODIFICADA) */}
                <div className="flex items-center gap-4 mb-8"> {/* Alterado: sempre flex-row e items-center */}
                    <h2 className="text-2xl font-semibold whitespace-nowrap">{title}</h2>
                    {/* Alterado: removido w-full e md:w-auto */}
                    {filter && <div className="flex-1">{filter}</div>}
                </div>

                {/* Área para os cartões (conteúdo específico da página) */}
                <div className="flex flex-col gap-6">{children}</div>

                {/* Área para ações (botão de "Adicionar", etc.) */}
                {actions && <div className="flex justify-end mt-10">{actions}</div>}
            </main>
        </div>
    );
};

export default DashboardLayout;
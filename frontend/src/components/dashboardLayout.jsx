// src/components/dashboardLayout.jsx
import React from "react";
import Header from "./header";
import { useAuth } from "../hooks/useAuth"; // <-- 1. Importar

const DashboardLayout = ({
                             title,
                             filter,
                             actions,
                             children,

                             floatingAction,
                         }) => {
    const { user } = useAuth();

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Header fixo */}
            <div className="flex-none">
                {/* 4. Passar user?.email diretamente para o Header */}
                <Header userType="Admin" email={user?.email} />
            </div>

            {/* Container principal com padding lateral */}
            <div className="flex-1 flex flex-col px-10 overflow-hidden">
                {/* Título e filtro */}
                <div className="flex-none py-6">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-semibold whitespace-nowrap">{title}</h2>
                        {filter && <div className="flex-1">{filter}</div>}
                    </div>
                </div>

                {/* Conteúdo principal scrollável */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-6">
                        {children}
                    </div>
                </div>

                {/* Área de ações no fundo (não flutuante) */}
                {actions && (
                    <div className="flex-none py-4">
                        <div className="flex justify-end">
                            {actions}
                        </div>
                    </div>
                )}
            </div>

            {/* Botão flutuante fixo no canto inferior direito */}
            {floatingAction && (
                <div className="fixed bottom-6 right-6 z-50">
                    {floatingAction}
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
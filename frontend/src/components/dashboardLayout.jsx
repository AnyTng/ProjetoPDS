import React from "react";
import Header from "./header";

const DashboardLayout = ({ title, filter, actions, children, email }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Área fixa */}
            <div className="flex-none">
                <Header userType="Admin" email={email} />
            </div>

            {/* Container principal com padding lateral */}
            <div className="flex-1 flex flex-col px-10 overflow-hidden">
                {/* Cabeçalho da página - fixo */}
                <div className="flex-none py-6">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-semibold whitespace-nowrap">{title}</h2>
                        {filter && <div className="flex-1">{filter}</div>}
                    </div>
                </div>

                {/* Área de conteúdo - scrollável */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-6">
                        {children}
                    </div>
                </div>

                {/* Área de ações - fixa na parte inferior */}
                {actions && (
                    <div className="flex-none py-4">
                        <div className="flex justify-end">
                            {actions}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
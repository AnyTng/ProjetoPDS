import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import FilterInput from "../components/FilterInput";
import FloatingButton from "../components/floatingButton.jsx";

export default {
    title: "Layouts/DashboardLayout",
    component: DashboardLayout,
};

const Template = (args) => <DashboardLayout {...args} />;

export const Default = Template.bind({});
Default.args = {
    title: "Exemplo de Título",
    filter: (
        <FilterInput
            placeholder="Filtrar..."
            onChange={() => {}}
            value=""
        />
    ),
    actions: (
        <FloatingButton onClick={() => alert("Clicado!")}>
            <span className="text-xl">+</span> Ação
        </FloatingButton>
    ),
    children: (
        <>
            <div className="bg-white p-4 rounded shadow">Cartão 1</div>
            <div className="bg-white p-4 rounded shadow">Cartão 2</div>
        </>
    ),
};
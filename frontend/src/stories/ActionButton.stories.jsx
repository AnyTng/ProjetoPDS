import React from "react";
import ActionButton from "../components/ActionButton";


export default {
    title: "Componentes/ActionButton",
    component: ActionButton,
};

export const Padrao = () => (
    <ActionButton onClick={() => alert("Ação clicada!")}>
        <span className="text-xl">+</span> Adicionar
    </ActionButton>
);
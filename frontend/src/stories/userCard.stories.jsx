// src/stories/userCard.stories.jsx
import React from "react";
import UserCard from "../components/Cards/userCard.jsx";

export default {
    title: "Components/UserCard",
    component: UserCard,
    tags: ["autodocs"],
};

const Template = (args) => <UserCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    userId: "12345",
    estado: "Ativo",
    nome: "João Silva",
    contacto: "+351 912 345 678",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg", // Exemplo de URL de imagem
    onVerInfoClick: () => console.log("Ver Informação Completa clicado"),
};
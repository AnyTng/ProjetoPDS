// src/stories/usersPageAdmin.stories.jsx
import React from "react";
import UsersPageAdmin from "../pages/Admin/usersPageAdmin.jsx";

// Mock de utilizadores simulando o que viria da API
const mockUsers = [
    {
        id: "1",
        nome: "João Silva",
        estado: "Ativo",
        contacto: "+351 912 345 678",
        imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: "2",
        nome: "Maria Costa",
        estado: "Inativo",
        contacto: "+351 934 123 456",
        imageUrl: "https://randomuser.me/api/portraits/women/45.jpg",
    },
    {
        id: "3",
        nome: "Carlos Mendes",
        estado: "Ativo",
        contacto: "+351 968 987 321",
        imageUrl: null,
    },
];

export default {
    title: "Páginas/UsersPageAdmin",
    component: UsersPageAdmin,
    tags: ["autodocs"],
};

const Template = (args) => <UsersPageAdmin {...args} />;

export const Default = Template.bind({});
Default.args = {
    email: "admin@email.com",
    users: mockUsers,
};
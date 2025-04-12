import React from "react";
import NotificationsPageAdmin from "../pages/Admin/notificationsPageAdmin.jsx";
import { MemoryRouter } from "react-router-dom";

export default {
    title: "Pages/NotificationsPageAdmin",
    component: NotificationsPageAdmin,
    decorators: [
// eslint-disable-next-line no-unused-vars
        (Story) => (
            <MemoryRouter>
                <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
    argTypes: {
        notifications: {
            control: "object",
            description: "Lista de notificações dinâmicas para o painel",
        },
        email: {
            control: "text",
            description: "Email do utilizador (exibido no header)",
        },
    },
};

const Template = (args) => <NotificationsPageAdmin {...args} />;

export const Default = Template.bind({});
Default.args = {
    email: "admin@empresa.com",
    notifications: [
        {
            id: 1,
            title: "Novo utilizador registado",
            message: "Maria Pereira completou o registo na plataforma.",
            actionLabel: "Ver perfil",
            actionLink: "/admin/users/1",
        },
        {
            id: 2,
            title: "Erro no servidor",
            message: "500 Internal Server Error no endpoint /api/v1.",
            actionLabel: "Ver detalhes",
            actionLink: "/admin/logs",
        },
    ],
};

export const SemNotificacoes = Template.bind({});
SemNotificacoes.args = {
    email: "admin@empresa.com",
    notifications: [],
};

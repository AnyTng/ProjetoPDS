import React from "react";
import Header from "../components/header";


export default {
    title: "Componentes/Header",
    component: Header,
    argTypes: {
        userType: {
            control: { type: "select" },
            options: ["Admin", "Prestador", "Cliente", "Outro"],
        },
        email: { control: "text" },
    },
};

const Template = (args) => <Header {...args} />;

export const Admin = Template.bind({});
Admin.args = {
    userType: "Admin",
    email: "admin@email.com",
};

export const Prestador = Template.bind({});
Prestador.args = {
    userType: "Prestador",
    email: "prestador@email.com",
};

export const Cliente = Template.bind({});
Cliente.args = {
    userType: "Cliente",
    email: "cliente@email.com",
};

export const Outro = Template.bind({});
Outro.args = {
    userType: "Outro",
    email: "email@email.com",
};
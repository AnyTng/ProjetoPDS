import React from 'react';
import MenuBar from '../components/menuBar.jsx';

export default {
    title: 'Components/menuBar',
    component: MenuBar,
    argTypes: {
        logoutText: { control: 'text' },
        onLogout: { action: 'logout clicked' },
    },
};

const Template = (args) => <MenuBar {...args} />;

export const Default = Template.bind({});
Default.args = {
    logoutText: 'Desconectar',
    menuItems: [
        { label: 'Multas', onClick: () => alert('Ir para Multas') },
        { label: 'Faturas', onClick: () => alert('Ir para Faturas') },
        { label: 'Veículos', onClick: () => alert('Ir para Veículos') },
        { label: 'Alugueres', onClick: () => alert('Ir para Alugueres') },
        { label: 'Notificações', onClick: () => alert('Ir para Notificações') },
        { label: 'Utilizadores', onClick: () => alert('Ir para Utilizadores') },
        { label: 'Concursos', onClick: () => alert('Ir para Concursos') },
    ],
};
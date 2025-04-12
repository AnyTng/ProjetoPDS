import PropostasPageAdmin from "../pages/Admin/propostasCarroAdmin.jsx";

export default {
    title: "Pages/PropostasPageAdmin",
    component: PropostasPageAdmin,
};

const Template = (args) => <PropostasPageAdmin {...args} />;

export const ComMockData = Template.bind({});
ComMockData.args = {
    email: "admin@email.com",
    pedidos: [
        {
            id: "p001",
            carroId: "BMW-X1",
            carroNome: "BMW X1",
            empresa: "Oficina Velocidade",
            data: "2025-04-10",
            valor: "€450",
            TipoManutencao: "Revisão geral",
        },
        {
            id: "p002",
            carroId: "TOY-123",
            carroNome: "Toyota Yaris",
            empresa: "AutoManutenção SA",
            data: "2025-04-11",
            valor: "€380",
            TipoManutencao: "Mudança de óleo",
        },
    ],
};
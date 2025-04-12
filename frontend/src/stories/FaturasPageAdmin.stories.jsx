import FaturasPageAdmin from "../pages/Admin/faturasPageAdmin.jsx";

export default {
    title: "Páginas/Admin/FaturasPageAdmin",
    component: FaturasPageAdmin,
};

const Template = (args) => <FaturasPageAdmin {...args} />;

export const ComFaturasMock = Template.bind({});
ComFaturasMock.args = {
    email: "admin@email.com",
    faturas: [
        {
            faturaId: "FAT-001",
            type: "aluguer",
            carId: "C-123",
            valor: "€180.00",
            data: "2025-04-10",
            userId: "USR-101",
        },
        {
            faturaId: "FAT-002",
            type: "servico",
            carId: "C-987",
            valor: "€75.00",
            data: "2025-04-08",
            servico: "Substituição de óleo",
        },
    ],
};
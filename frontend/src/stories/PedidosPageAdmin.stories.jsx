import PedidosPageAdmin from "../pages/pedidosPageAdmin";

export default {
    title: "Pages/PedidosPageAdmin",
    component: PedidosPageAdmin,
};

const pedidosMock = [
    {
        id: 1,
        userId: "user123",
        carroId: "Mazda CX-5",
        nome: "Rita Gomes",
        status: "Aceite",
        startDate: "2025-04-12",
        endDate: "2025-04-18",
        value: "€300",
        imageUrl: "https://via.placeholder.com/150",
    },
    {
        id: 2,
        userId: "user456",
        carroId: "BMW X3",
        nome: "Carlos Santos",
        status: "Rejeitado",
        startDate: "2025-04-10",
        endDate: "2025-04-15",
        value: "€400",
        imageUrl: null,
    },
];

const Template = (args) => <PedidosPageAdmin {...args} />;

export const ListaDePedidos = Template.bind({});
ListaDePedidos.args = {
    pedidos: pedidosMock,
    email: "admin@email.com",
};
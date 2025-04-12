import ConcursosManAdmin from "../pages/Admin/concursosManAdmin.jsx";

export default {
    title: "Pages/ConcursosManAdmin",
    component: ConcursosManAdmin,
};

const mockPedidos = [
    {
        concursoId: "c001",
        carroId: "TOY-123",
        carroNome: "Toyota Yaris",
        estado: "pendente",
        TipoManutencao: "Mudança de óleo",
        imageUrl: "https://via.placeholder.com/150",
    },
    {
        concursoId: "c002",
        carroId: "BMW-456",
        carroNome: "BMW X5",
        estado: "aceite",
        TipoManutencao: "Revisão geral",
        valor: "€580",
        imageUrl: null,
    },
    {
        concursoId: "c003",
        carroId: "AUD-789",
        carroNome: "Audi A4",
        estado: "finalizado",
        TipoManutencao: "Substituição de travões",
        valor: "€300",
        imageUrl: "https://via.placeholder.com/150",
    },
];

const Template = (args) => <ConcursosManAdmin {...args} />;

export const ListaDeConcursos = Template.bind({});
ListaDeConcursos.args = {
    pedidos: mockPedidos,
    email: "admin@email.com",
};
import CarsPageAdmin from "../pages/Admin/carsPageAdmin.jsx";

export default {
    title: "Páginas/CarsPageAdmin",
    component: CarsPageAdmin,
};

const Template = (args) => <CarsPageAdmin {...args} />;

export const ListaDeCarros = Template.bind({});
ListaDeCarros.args = {
    email: "admin@email.com",
    carros: [
        {
            CarroId: "C-001",
            CarroNome: "Honda Civic",
            UltimaManutencao: "2025-03-01",
            Estado: "Disponível",
            imageUrl: "https://via.placeholder.com/150",
        },
        {
            CarroId: "C-002",
            CarroNome: "Peugeot 208",
            UltimaManutencao: "2025-01-15",
            Estado: "Avariado",
            imageUrl: "",
        },
    ],
};

export const NenhumCarro = Template.bind({});
NenhumCarro.args = {
    email: "admin@email.com",
    carros: [],
};
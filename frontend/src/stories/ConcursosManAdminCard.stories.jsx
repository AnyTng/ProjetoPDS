import ConcursosManutencaoAdminCard from "../components/Cards/concursosManutencaoAdminCard.jsx";

export default {
    title: "Components/ConcursosManAdminCard",
    component: ConcursosManutencaoAdminCard,
};

const Template = (args) => <ConcursosManutencaoAdminCard {...args} />;

export const Pendente = Template.bind({});
Pendente.args = {
    carroId: "ID123",
    carroNome: "Toyota Corolla",
    estado: "pendente",
    TipoManutencao: "Mudança de óleo",
    imageUrl: "https://via.placeholder.com/150",
    concursoId: "abc-001",
    // Não inclui 'valor'
};

export const Aceite = Template.bind({});
Aceite.args = {
    carroId: "ID456",
    carroNome: "BMW X5",
    estado: "aceite",
    TipoManutencao: "Revisão completa",
    valor: "€520", // Incluído porque está aceite
    imageUrl: null,
    concursoId: "abc-002",
};
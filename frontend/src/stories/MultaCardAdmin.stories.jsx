import MultaCardAdmin from "../components/Cards/multaCardAdmin.jsx";

export default {
    title: "Componentes/MultaCardAdmin",
    component: MultaCardAdmin,
};

const Template = (args) => <MultaCardAdmin {...args} />;

export const MultaPendente = Template.bind({});
MultaPendente.args = {
    AluguerId: "ALG-001",
    ClienteNome: "Maria Silva",
    DataAtribuicao: "2025-04-10",
    DataLimite: "2025-04-15",
    Estado: "pendente",
    Contacto: "912345678",
    Valor: "€120",
    ContestacaoId: null,
};

export const MultaPaga = Template.bind({});
MultaPaga.args = {
    AluguerId: "ALG-002",
    ClienteNome: "João Costa",
    DataAtribuicao: "2025-03-25",
    DataPagamento: "2025-03-28",
    Estado: "paga",
    Contacto: "913456789",
    Valor: "€95",
    ContestacaoId: null,
};

export const ComContestacao = Template.bind({});
ComContestacao.args = {
    AluguerId: "ALG-003",
    ClienteNome: "Inês Rocha",
    DataAtribuicao: "2025-04-01",
    DataLimite: "2025-04-08",
    Estado: "pendente",
    Contacto: "914567890",
    Valor: "€200",
    ContestacaoId: "CST-45",
};
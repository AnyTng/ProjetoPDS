import PropostaCardAdmin from "../components/PropostaCardAdmin";

export default {
    title: "Components/PropostaCardAdmin",
    component: PropostaCardAdmin,
};

const Template = (args) => <PropostaCardAdmin {...args} />;

export const Padrao = Template.bind({});
Padrao.args = {
    CarroId: "CARRO-123",
    CarroNome: "Toyota Corolla",
    EmpresaNome: "AutoManutenção SA",
    Data: "2025-04-11",
    Valor: "€480",
    TipoManutencao: "Troca de pneus e alinhamento",
};
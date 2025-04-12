import FaturaCard from "../components/Cards/faturaCard.jsx";

export default {
    title: "Componentes/FaturaCard",
    component: FaturaCard,
};

const Template = (args) => <FaturaCard {...args} />;

export const FaturaAluguer = Template.bind({});
FaturaAluguer.args = {
    Type: "aluguer",
    CarId: "C-123",
    Valor: "€140.00",
    FaturaId: "FAT-001",
    Data: "2025-04-10",
    UserId: "USR-456",
};

export const FaturaServico = Template.bind({});
FaturaServico.args = {
    Type: "servico",
    CarId: "C-789",
    Valor: "€230.00",
    FaturaId: "FAT-002",
    Data: "2025-04-11",
    Servico: "Mudança de pneus",
};
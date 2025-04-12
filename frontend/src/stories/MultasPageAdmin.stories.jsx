import MultasPageAdmin from "../pages/Admin/multasPageAdmin.jsx";

export default {
    title: "Páginas/MultasPageAdmin",
    component: MultasPageAdmin,
};

const Template = (args) => <MultasPageAdmin {...args} />;

export const ComMultasMock = Template.bind({});
ComMultasMock.args = {
    multas: [
        {
            multaId: "MUL-001",
            aluguerId: "ALG-123",
            clienteNome: "Joana Pereira",
            contacto: "912345678",
            estado: "pendente",
            valor: "€120",
            dataAtribuicao: "2025-04-10",
            dataLimite: "2025-04-20",
            dataPagamento: null,
            contestacaoId: null,
        },
        {
            multaId: "MUL-002",
            aluguerId: "ALG-456",
            clienteNome: "Carlos Moreira",
            contacto: "913456789",
            estado: "paga",
            valor: "€85",
            dataAtribuicao: "2025-03-01",
            dataPagamento: "2025-03-05",
            contestacaoId: "CST-77",
        },
    ],
    email: "admin@email.com",
};
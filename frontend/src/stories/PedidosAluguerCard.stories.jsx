import PedidoAluguerCard from "../components/pedidoAluguerCard";

export default {
    title: "Components/PedidoAluguerCard",
    component: PedidoAluguerCard,
};

const Template = (args) => <PedidoAluguerCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    userId: "user123",
    carroId: "Toyota Corolla",
    nome: "João Silva",
    status: "Pendente",
    startDate: "2025-04-15",
    endDate: "2025-04-20",
    value: "€250",
    imageUrl: "https://via.placeholder.com/150",
    onVerInfoClick: () => alert("Mostrar informação completa"),
};

export const SemImagem = Template.bind({});
SemImagem.args = {
    ...Default.args,
    imageUrl: null,
};
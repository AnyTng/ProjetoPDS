
import ReceiptCard from "../components/receiptCard";

export default {
    title: "Components/ReceiptCard",
    component: ReceiptCard,
    tags: ['autodocs'],
};

const Template = (args) => <ReceiptCard {...args} />;

export const Aluguer = Template.bind({});
Aluguer.args = {
    tipo: "aluguer",
    carroId: "VW1234",
    utilizador: "João Silva",
    data: "06/04/2025",
    valor: "38€",
    idFatura: "1283719828741",
    onDownloadClick: () => alert("Download da fatura de aluguer"),
};

export const Servico = Template.bind({});
Servico.args = {
    tipo: "servico",
    carroId: "BMW5678",
    servicoPrestado: "Troca de óleo",
    data: "05/04/2025",
    valor: "65€",
    idFatura: "987654321123",
    onDownloadClick: () => alert("Download da fatura de serviço"),
};

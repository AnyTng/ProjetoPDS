import VeiculoCard from "../components/Cards/veiculoCard.jsx";

export default {
    title: "Componentes/Admin/VeiculoCard",
    component: VeiculoCard,
};

const Template = (args) => <VeiculoCard {...args} />;

export const ComImagem = Template.bind({});
ComImagem.args = {
    CarroId: "VEIC-001",
    CarroNome: "Toyota Corolla",
    UltimaManutencao: "2025-03-15",
    Estado: "Disponível",
    imageUrl: "https://via.placeholder.com/150", // imagem mockada
};

export const SemImagem = Template.bind({});
SemImagem.args = {
    CarroId: "VEIC-002",
    CarroNome: "Renault Clio",
    UltimaManutencao: "2025-02-01",
    Estado: "Em manutenção",
    imageUrl: "", // ativa o placeholder SVG
};
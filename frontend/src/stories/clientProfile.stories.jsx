import ClientProfile from "../pages/clientProfile.jsx";
import profilePic from "../assets/react.svg"; // substitui pela imagem real

export default {
    title: "Pages/ClientProfile",
    component: ClientProfile,
    argTypes: {
        userImage: { control: "text" },
        userData: { control: "object" },
    },
};

const Template = (args) => <ClientProfile {...args} />;

export const Default = Template.bind({});
Default.args = {
    userImage: profilePic,
    userData: [
        { label: "Nome", value: "Ana Paulo" },
        { label: "Email", value: "ana@email.com" },
        { label: "Telefone", value: "912345678" },
        { label: "Morada", value: "Rua Exemplo, 123" },
        { label: "Código Postal", value: "1000-001" },
        { label: "Cidade", value: "Lisboa" },
        { label: "País", value: "Portugal" },
        { label: "NIF", value: "987654321" },
    ]
};
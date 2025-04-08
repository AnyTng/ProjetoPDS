import ClientHeader from "../components/clientHeader.jsx";
import profilePic from "../assets/react.svg"; // substitui por uma imagem real de perfil se quiseres

export default {
    title: "Components/ClientHeader",
    component: ClientHeader,
};

const Template = (args) => <ClientHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
    userImage: profilePic,
};
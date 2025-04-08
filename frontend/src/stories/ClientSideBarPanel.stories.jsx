import ClientSidebarPanel from "../components/ClientSidebarPanel";
import profilePic from "../assets/react.svg"; // Substitui por imagem real se quiseres

export default {
    title: "Components/ClientSidebarPanel",
    component: ClientSidebarPanel,
    argTypes: {
        userImage: { control: "text" },
        userName: { control: "text" },
        showDivider: { control: "boolean" },
    },
};

const Template = (args) => (
    <div className="w-full max-w-md mx-auto p-6 bg-white shadow rounded-xl">
        <div className="grid md:grid-cols-3 min-h-[400px]">
            <ClientSidebarPanel {...args} />
            <div className="col-span-2"></div> {/* simula a segunda coluna */}
        </div>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    userImage: profilePic,
    userName: "Ana Paulo",
    showDivider: true,
};
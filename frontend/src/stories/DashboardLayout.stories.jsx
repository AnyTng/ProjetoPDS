import DashboardLayout from "../components/dashboardLayout";
import FloatingButton from "../components/floatingButton";

export default {
    title: "Layout/DashboardLayout",
    component: DashboardLayout,
    argTypes: {
        floatingButtonEnabled: { control: "boolean", name: "Ativar botão flutuante" },
        floatingButtonType: {
            control: { type: "select" },
            options: ["add", "remove", "upload"],
            name: "Tipo do botão",
        },
        floatingButtonText: {
            control: "text",
            name: "Texto do botão",
        },
    },
};

const Template = ({
                      floatingButtonEnabled,
                      floatingButtonType,
                      floatingButtonText,
                      ...args
                  }) => {
    const floatingButton = floatingButtonEnabled ? (
        <FloatingButton
            type={floatingButtonType}
            text={floatingButtonText}
            onClick={() =>
                console.log(`[Botão Flutuante] Tipo: ${floatingButtonType} | Texto: ${floatingButtonText}`)
            }
        />
    ) : null;

    return <DashboardLayout {...args} floatingAction={floatingButton} />;
};

export const ComControlo = Template.bind({});
ComControlo.args = {
    title: "Página de Teste",
    email: "admin@email.com",
    filter: <input type="text" placeholder="Pesquisar..." className="border p-2 rounded" />,
    children: (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded shadow">Conteúdo 1</div>
            <div className="bg-white p-4 rounded shadow">Conteúdo 2</div>
            <div className="bg-white p-4 rounded shadow">Conteúdo 3</div>
        </div>
    ),
    floatingButtonEnabled: true,
    floatingButtonType: "add",
    floatingButtonText: "Criar coisa",
};
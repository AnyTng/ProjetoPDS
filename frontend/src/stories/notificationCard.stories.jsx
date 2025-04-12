import NotificationCard from "../components/Cards/notificationCard.jsx";

export default {
    title: "Components/NotificationCard",
    component: NotificationCard,
    argTypes: {
        title: { control: "text" },
        message: { control: "text" },
        actionLabel: { control: "text" },
        onActionClick: { action: "action clicked!" }
    },
};

const Template = (args) => (
    <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <NotificationCard {...args} />
    </div>
);

export const Admin = Template.bind({});
Admin.args = {
    title: "Título",
    message: "Notificação",
    actionLabel: "Tomar Ação",
};
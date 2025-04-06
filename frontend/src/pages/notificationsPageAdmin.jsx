// src/pages/notificationsPageAdmin.jsx
import React, { useState } from "react";
import DashboardLayout from "../components/dashboardLayout";
import NotificationCard from "../components/notificationCard";
import FilterInput from "../components/filterInput";

const dummyNotifications = [
    {
        id: 1,
        title: "Novo utilizador registado",
        message: "Maria Pereira completou o registo na plataforma.",
    },
    {
        id: 2,
        title: "Erro no servidor",
        message: "500 Internal Server Error no endpoint /api/v1.",
    },
    {
        id: 3,
        title: "Ajuda requisitada",
        message: "João solicitou ajuda no suporte técnico.",
    },
];

const NotificationsPageAdmin = () => {
    const [search, setSearch] = useState("");

    const filtered = dummyNotifications.filter((notif) =>
        notif.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Notificações"
            filter={
                <FilterInput
                    placeholder="Pesquisar notificações..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            }
        >
            {filtered.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600 text-lg text-center">
                        Nenhuma notificação corresponde à pesquisa.
                    </p>
                </div>
            ) : (
                filtered.map((notif) => (
                    <NotificationCard
                        key={notif.id}
                        title={notif.title}
                        message={notif.message}
                        actionLabel="Ver mais"
                        onActionClick={() => console.log("Clicou em:", notif.id)}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default NotificationsPageAdmin;

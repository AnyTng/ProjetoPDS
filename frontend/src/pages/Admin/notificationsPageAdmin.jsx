import React, { useState } from "react";
import DashboardLayout from "../../components/dashboardLayout.jsx";
import NotificationCard from "../../components/Cards/notificationCard.jsx";
import FilterInput from "../../components/filterInput.jsx";

const NotificationsPageAdmin = ({ notifications = [], email = "admin@email.com" }) => {
    const [search, setSearch] = useState("");

    const filtered = notifications.filter((notif) =>
        notif.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout
            title="Notificações"
            email={email}
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
                        actionLabel={notif.actionLabel}
                        actionLink={notif.actionLink}
                    />
                ))
            )}
        </DashboardLayout>
    );
};

export default NotificationsPageAdmin;
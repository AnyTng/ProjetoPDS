// src/stories/notificationPanelAdmin.stories.jsx
import React from "react";
import NotificationsPageAdmin from "../pages/notificationsPageAdmin";
import { MemoryRouter } from "react-router-dom";

export default {
    title: "Pages/NotificationsPageAdmin",
    component: NotificationsPageAdmin,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
};

export const Default = () => <NotificationsPageAdmin />;
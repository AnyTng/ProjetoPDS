import React from "react";
import FloatingButton from "../components/floatingButton.jsx";

export default {
    title: "Components/FloatingButton",
    component: FloatingButton,
    argTypes: {
        type: {
            control: { type: "select" },
            options: ["none", "add", "remove"],
        },
        text: { control: "text" },
        onClick: { action: "clicked" },
    },
};

const Template = (args) => <FloatingButton {...args} />;

export const Default = Template.bind({});
Default.args = {
    type: "none",
    text: "",
};

export const AddButton = Template.bind({});
AddButton.args = {
    type: "add",
    text: "Atribuir Multa",
};

export const UploadButton = Template.bind({});
UploadButton.args = {
    type: "upload",
    text: "Enviar",
};

export const RemoveButton = Template.bind({});
RemoveButton.args = {
    type: "remove",
    text: "Remover",
};
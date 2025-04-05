import React from "react";
import ActionButton from "../components/actionButton";

export default {
    title: "Components/ActionButton",
    component: ActionButton,
    argTypes: {
        type: {
            control: { type: "select" },
            options: ["none", "add", "remove"],
        },
        text: { control: "text" },
        onClick: { action: "clicked" },
    },
};

const Template = (args) => <ActionButton {...args} />;

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
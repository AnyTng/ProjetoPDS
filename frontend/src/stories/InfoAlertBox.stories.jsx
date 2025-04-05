import React from 'react';
import InfoAlertBox from '../components/alertBox.jsx';

export default {
    title: 'Components/InfoAlertBox',
    component: InfoAlertBox,
    argTypes: {
        title: { control: 'text' },
        message: { control: 'text' },
        buttonText: { control: 'text' },
        onClose: { action: 'closed' },
        onAction: { action: 'button clicked' },
    },
};

const Template = (args) => <InfoAlertBox {...args} />;

export const Default = Template.bind({});
Default.args = {
    title: 'Título',
    message: 'Texto de exemplo.',
    buttonText: 'Confirmar',
};
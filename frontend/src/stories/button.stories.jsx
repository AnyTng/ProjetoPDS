import React from 'react';
import Button from '../components/button.jsx';

export default {
    title: 'Components/Button',
    component: Button,
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'text', 'danger', 'default'],
        },
        onClick: { action: 'clicked' },
    },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    text: 'Primary Button',
    variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
    text: 'Secondary Button',
    variant: 'secondary',
};

export const Text = Template.bind({});
Text.args = {
    text: 'Text Button',
    variant: 'text',
};

export const Danger = Template.bind({});
Danger.args = {
    text: 'Danger Button',
    variant: 'danger',
};

export const Default = Template.bind({});
Default.args = {
    text: 'Default Button',
};
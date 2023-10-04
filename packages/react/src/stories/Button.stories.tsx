import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components";

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["primary", "outlined"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  render: (args) => <Button {...args}>button</Button>,
};

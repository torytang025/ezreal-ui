import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { Button } from "../components";

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["filled", "outlined"],
      defaultValue: "filled",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    type: "filled",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  render: (args) => <Button {...args}>Button</Button>,
};

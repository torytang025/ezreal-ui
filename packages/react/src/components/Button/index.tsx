import { forwardRef } from "react";

const Button = () => {
  return <button>button</button>;
};

const ButtonRef = forwardRef(Button);

export default ButtonRef;

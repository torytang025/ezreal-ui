import { PropsWithChildren, forwardRef } from "react";
import { ButtonProps } from "./interface";

function Button(
  props: PropsWithChildren<ButtonProps>,
  ref: React.LegacyRef<HTMLButtonElement>
) {
  const { children, type } = props;
  return <button ref={ref}>{children}</button>;
}

const ButtonRef = forwardRef(Button);

ButtonRef.displayName = "Button";
ButtonRef.defaultProps = {
  type: "primary",
};

export default ButtonRef;

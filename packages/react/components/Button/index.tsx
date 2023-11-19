import cs from "classnames";
import React, { forwardRef, useContext } from "react";
import { ConfigContext } from "../ConfigContext";
import { ButtonProps } from "./interface";

import "./index.less";

function Button(props: ButtonProps, ref: React.LegacyRef<HTMLButtonElement>) {
  const { getPrefixCls } = useContext(ConfigContext);
  const { children, type, className, disabled } = props;

  const prefix = getPrefixCls("button");

  const classNames = cs(
    prefix,
    {
      [`${prefix}-${type}`]: type,
      [`${prefix}-default`]: !disabled,
      [`${prefix}-disabled`]: disabled,
    },
    className,
  );

  return (
    <button ref={ref} className={classNames}>
      {children}
    </button>
  );
}

const ButtonRef = forwardRef(Button);

ButtonRef.displayName = "Button";
ButtonRef.defaultProps = {
  type: "filled",
};

export default ButtonRef;

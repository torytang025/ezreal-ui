import cs from "classnames";
import React, { forwardRef, useContext } from "react";
import { ConfigContext } from "../ConfigContext";
import { ButtonProps } from "./interface";

import "./index.less";

function Button(props: ButtonProps, ref: React.LegacyRef<HTMLButtonElement>) {
  const { getPrefixCls } = useContext(ConfigContext);
  const { children, type, className } = props;

  const prefix = getPrefixCls("button");

  const classNames = cs(
    prefix,
    {
      [`${prefix}-${type}`]: type,
    },
    className
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
  type: "primary",
};

export default ButtonRef;

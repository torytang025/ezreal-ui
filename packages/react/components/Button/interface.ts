import { CSSProperties } from "react";

export interface ButtonProps {
  className?: string | string[];
  style?: CSSProperties;
  children?: React.ReactNode;
  type?: "filled" | "outlined";
  disabled?: boolean;
}

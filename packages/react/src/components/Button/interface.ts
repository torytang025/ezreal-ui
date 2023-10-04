import { CSSProperties } from "react";

export interface ButtonProps {
  className?: string | string[];
  style?: CSSProperties;
  type?: "primary" | "outlined";
  children?: React.ReactNode;
}

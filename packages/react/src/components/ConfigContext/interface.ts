export interface ConfigContextProps {
  theme?: "light" | "dark";
  prefixCls?: string;
  getPrefixCls?: (componentName: string, customPrefix?: string) => string;
  children?: React.ReactNode;
}

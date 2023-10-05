import { omit } from "lodash-es";
import { createContext, useEffect } from "react";
import useMergeProps from "../utils/hooks/use-merge-props";
import { ConfigContextProps } from "./interface";

function setTheme(theme: ConfigContextProps["theme"]) {
  const root = document.body;
  root.setAttribute("theme", theme!);
}

const defaultConfig: ConfigContextProps = {
  theme: "light",
  prefixCls: "ezreal",
};

export const ConfigContext = createContext<ConfigContextProps>({
  getPrefixCls: (componentName: string, customPrefix?: string) =>
    `${customPrefix || "ezreal"}-${componentName}`,
  ...defaultConfig,
});

function ConfigProvider(initProps: ConfigContextProps) {
  const props = useMergeProps(initProps, defaultConfig);
  const { prefixCls, theme, children } = props;

  useEffect(() => {
    setTheme(theme);
  }, [theme]);

  function getPrefixCls(componentName: string, customPrefix?: string) {
    return `${customPrefix || prefixCls}-${componentName}`;
  }

  const config: ConfigContextProps = {
    ...omit(props, ["children"]),
    getPrefixCls,
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

ConfigProvider.ConfigContext = ConfigContext;

ConfigProvider.displayName = "ConfigProvider";

export default ConfigProvider;

export const ConfigConsumer = ConfigContext.Consumer;

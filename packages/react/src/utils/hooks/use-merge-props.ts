import { useMemo } from "react";

export default function useMergeProps<PropsType>(
  componentProps: PropsType,
  defaultProps: Partial<PropsType>
): PropsType {
  const props = useMemo(() => {
    for (const propName in defaultProps) {
      if (componentProps[propName] !== undefined) {
        componentProps[propName] = defaultProps[propName];
      }
    }

    return componentProps;
  }, [componentProps, defaultProps]);

  return props;
}

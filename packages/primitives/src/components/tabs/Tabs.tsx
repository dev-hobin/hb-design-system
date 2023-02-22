import React, { createContext, ElementRef, forwardRef, useId, useMemo, useState } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { useContollableState } from "../../hooks/useContollableState";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveUlProps = PrimitivePropsWithoutRef<typeof Primitive.ul>;
type PrimitiveLiProps = PrimitivePropsWithoutRef<typeof Primitive.li>;

type RootContextValue = {
  orientation: "horizontal" | "vertical";
  activation: "automatic" | "manual";
  baseId: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
};
const RootContext = createContext<RootContextValue | null>(null);

type RootElement = ElementRef<typeof Primitive.div>;
interface RootProps extends PrimitiveDivProps {
  orientation?: "horizontal" | "vertical";
  activation?: "automatic" | "manual";
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const Root = forwardRef<RootElement, RootProps>((props, ref) => {
  const {
    orientation = "horizontal",
    activation = "automatic",
    value: theirValue,
    onValueChange: therieValueChange,
    defaultValue,
    ...restProps
  } = props;

  const [value, setValue] = useContollableState(theirValue, therieValueChange, defaultValue);

  const baseId = useId();

  const contextValue = useMemo(
    () => ({ orientation, activation, value, onValueChange: setValue, baseId }),
    [activation, baseId, orientation, setValue, value]
  );

  return (
    <RootContext.Provider value={contextValue}>
      <Primitive.div ref={ref} data-orientation={orientation} {...restProps} />
    </RootContext.Provider>
  );
});
Root.displayName = "Tabs";

type ListElement = ElementRef<typeof Primitive.ul>;
type ListProps = PrimitiveUlProps;
const List = forwardRef<ListElement, ListProps>((props, ref) => {
  const { orientation } = useStrictContext(RootContext);
  return (
    <Primitive.ul
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      {...props}
    />
  );
});
List.displayName = "Tabs.List";

type TabElement = ElementRef<typeof Primitive.li>;
interface TabProps extends PrimitiveLiProps {
  value: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
const Tab = forwardRef<TabElement, TabProps>((props, ref) => {
  const { value, disabled = false, onClick, ...rest } = props;
  const { baseId, value: currentValue, orientation, onValueChange } = useStrictContext(RootContext);
  const internalId = "tabs" + baseId + "tab" + value;
  const panelId = "tabs" + baseId + "content" + value;

  const handleClick = useCallbackRef(
    composePreventableEventHandlers(onClick, () => onValueChange(value))
  );

  return (
    <Primitive.li
      ref={ref}
      id={internalId}
      role="tab"
      aria-controls={panelId}
      aria-selected={value === currentValue}
      data-orientation={orientation}
      data-state={value === currentValue ? "active" : "inactive"}
      data-disabled={disabled}
      onClick={handleClick}
      {...rest}
    />
  );
});
Tab.displayName = "Tabs.Tab";

type PanelElement = ElementRef<typeof Primitive.div>;
interface PanelProps extends PrimitiveDivProps {
  value: string;
  forceMount?: boolean;
}
const Panel = forwardRef<PanelElement, PanelProps>((props, ref) => {
  const { value, forceMount = false, ...rest } = props;
  const { baseId, value: currentValue, orientation } = useStrictContext(RootContext);
  const internalId = "tabs" + baseId + "content" + value;
  const tabId = "tabs" + baseId + "tab" + value;

  const isActive = value === currentValue;

  if (!forceMount && !isActive) return null;
  return (
    <Primitive.div
      ref={ref}
      id={internalId}
      role="tabpanel"
      aria-labelledby={tabId}
      data-orientation={orientation}
      data-state={isActive ? "active" : "inactive"}
      {...rest}
    />
  );
});
Panel.displayName = "Tabs.Panel";

export const Tabs = Object.assign(Root, { List, Tab, Panel });

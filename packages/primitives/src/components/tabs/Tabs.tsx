import React, {
  createContext,
  ElementRef,
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useControllableState } from "../../hooks/useControllableState";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Keys } from "../../utils/keyboard";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

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

  const [value, setValue] = useControllableState(theirValue, therieValueChange, defaultValue);

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

type ListElement = ElementRef<typeof Primitive.div>;
type ListProps = PrimitiveDivProps;
const List = forwardRef<ListElement, ListProps>((props, forwardedRef) => {
  const { orientation } = useStrictContext(RootContext);
  const [container, setContainer] = useState<ListElement | null>(null);

  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  useEffect(() => {
    if (container) {
      const keyboardEventHandler = (ev: KeyboardEvent) => {
        const activeElement = document.activeElement;
        if (container.contains(activeElement)) {
          const allTabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
          const currTabIndex = allTabs.indexOf(activeElement as HTMLElement);
          if (currTabIndex < 0) return;
          const lastIndex = allTabs.length - 1;
          switch (ev.code) {
            case Keys.ArrowRight:
              if (orientation !== "horizontal") break;
              if (currTabIndex === lastIndex) {
                allTabs[0]?.focus();
              } else {
                allTabs[currTabIndex + 1]?.focus();
              }
              break;
            case Keys.ArrowLeft:
              if (orientation !== "horizontal") break;
              if (currTabIndex === 0) {
                allTabs[lastIndex]?.focus();
              } else {
                allTabs[currTabIndex - 1]?.focus();
              }
              break;
            case Keys.ArrowDown:
              if (orientation !== "vertical") break;
              if (currTabIndex === lastIndex) {
                allTabs[0]?.focus();
              } else {
                allTabs[currTabIndex + 1]?.focus();
              }
              break;
            case Keys.ArrowUp:
              if (orientation !== "vertical") break;
              if (currTabIndex === 0) {
                allTabs[lastIndex]?.focus();
              } else {
                allTabs[currTabIndex - 1]?.focus();
              }
              break;
            case Keys.Home:
              allTabs[0]?.focus();
              break;
            case Keys.End:
              allTabs[lastIndex]?.focus();
              break;
            default:
              break;
          }
        }
      };
      container.addEventListener("keydown", keyboardEventHandler);

      return () => container.removeEventListener("keydown", keyboardEventHandler);
    }
  }, [container, orientation]);

  return (
    <Primitive.div
      ref={composedRef}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      {...props}
    />
  );
});
List.displayName = "Tabs.List";

type TabElement = ElementRef<typeof Primitive.button>;
interface TabProps extends PrimitiveButtonProps {
  value: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}
const Tab = forwardRef<TabElement, TabProps>((props, ref) => {
  const { value, disabled = false, onClick, onFocus, ...rest } = props;
  const {
    baseId,
    value: currentValue,
    orientation,
    activation,
    onValueChange,
  } = useStrictContext(RootContext);
  const internalId = "tabs" + baseId + "tab" + value;
  const panelId = "tabs" + baseId + "content" + value;

  const handleClick = useCallbackRef(
    composePreventableEventHandlers(onClick, () => onValueChange(value))
  );

  const handleFocus = useCallbackRef(
    composePreventableEventHandlers(onFocus, () => {
      if (activation === "automatic") {
        onValueChange(value);
      }
    })
  );

  const isActive = value === currentValue;

  return (
    <Primitive.button
      ref={ref}
      id={internalId}
      role="tab"
      aria-controls={panelId}
      aria-selected={isActive}
      data-orientation={orientation}
      data-state={isActive ? "active" : "inactive"}
      data-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      onFocus={handleFocus}
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
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      {...rest}
    />
  );
});
Panel.displayName = "Tabs.Panel";

export const Tabs = Object.assign(Root, { List, Tab, Panel });

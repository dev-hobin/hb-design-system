import React, { createContext, ElementRef, forwardRef, useCallback, useId, useMemo } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { useControllableState } from "../../hooks/useControllableState";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveH3Props = PrimitivePropsWithoutRef<typeof Primitive.h3>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

//
type RootContextVaue = {
  disabled?: boolean;
};
const RootContext = createContext<RootContextVaue | null>(null);
RootContext.displayName = "RootContext";
//

//
interface RootImplProps extends PrimitiveDivProps {
  disabled?: boolean;
}
interface SingleRootImplProps extends RootImplProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  collapsible?: boolean;
}
interface MultipleRootImplProps extends RootImplProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  defaultValue?: string[];
}
interface SingleRootProps extends SingleRootImplProps {
  type: "single";
}
interface MultipleRootProps extends MultipleRootImplProps {
  type: "multiple";
}
//

type RootElement = ElementRef<typeof Primitive.div>;
type RootProps = SingleRootProps | MultipleRootProps extends {
  type: infer TType;
}
  ? TType extends "single"
    ? SingleRootProps
    : MultipleRootProps
  : never;

const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const contextValue = useMemo(() => ({ disabled: props.disabled ?? false }), [props.disabled]);
  if (props.type === "single") {
    return (
      <RootContext.Provider value={contextValue}>
        <SingleRootImpl ref={forwardedRef} {...props} />
      </RootContext.Provider>
    );
  } else {
    return (
      <RootContext.Provider value={contextValue}>
        <MultipleRootImpl ref={forwardedRef} {...props} />;
      </RootContext.Provider>
    );
  }
});
Root.displayName = "Accordion";

//
type ValueContextVaue = {
  value: string[];
  onItemOpen: (value: string) => void;
  onItemClose: (value: string) => void;
};
const ValueContext = createContext<ValueContextVaue | null>(null);
ValueContext.displayName = "ValueContext";
//

const SingleRootImpl = forwardRef<RootElement, SingleRootProps>((props, forwardedRef) => {
  const {
    value: theirValue,
    onValueChange: theirHandler,
    defaultValue,
    collapsible = false,
    ...rest
  } = props;
  const [value, setValue] = useControllableState(theirValue, theirHandler, defaultValue);

  const handleItemOpen = setValue;
  const handleItemClose = useCallback(() => {
    if (collapsible) {
      setValue("");
    }
  }, [collapsible, setValue]);

  const valueContextValue = useMemo(
    () => ({
      value: value ? [value] : [],
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
    }),
    [value, handleItemOpen, handleItemClose]
  );

  return (
    <ValueContext.Provider value={valueContextValue}>
      <Primitive.div ref={forwardedRef} {...rest} />
    </ValueContext.Provider>
  );
});
SingleRootImpl.displayName = "Accordion.Single";

const MultipleRootImpl = forwardRef<RootElement, MultipleRootProps>((props, forwardedRef) => {
  const { value: theirValue, onValueChange: theirHandler, defaultValue, ...rest } = props;
  const [value = [], setValue] = useControllableState(theirValue, theirHandler, defaultValue);

  const handleItemOpen = useCallback(
    (curr: string) => {
      setValue([...value, curr]);
    },
    [value, setValue]
  );
  const handleItemClose = useCallback(
    (curr: string) => {
      setValue(value.filter((v) => v !== curr));
    },
    [value, setValue]
  );

  const valueContextValue = useMemo(
    () => ({ value, onItemOpen: handleItemOpen, onItemClose: handleItemClose }),
    [value, handleItemOpen, handleItemClose]
  );

  return (
    <ValueContext.Provider value={valueContextValue}>
      <Primitive.div ref={forwardedRef} {...rest} />
    </ValueContext.Provider>
  );
});
MultipleRootImpl.displayName = "Accordion.Multiple";

type ItemContextValue = {
  open: boolean;
  value: string;
  itemId: string;
  disabled: boolean;
};
const ItemContext = createContext<ItemContextValue | null>(null);
ItemContext.displayName = "ItemContext";

type ItemElement = ElementRef<typeof Primitive.div>;
interface ItemProps extends PrimitiveDivProps {
  value: string;
  disabled?: boolean;
}
const Item = forwardRef<ItemElement, ItemProps>((props, forwardedRef) => {
  const { value, disabled = false, ...rest } = props;
  const rootContext = useStrictContext(RootContext);
  const valueContext = useStrictContext(ValueContext);

  const itemId = useId();
  const isOpen = valueContext.value.includes(value);
  const isDisabled = rootContext.disabled || disabled;

  const contextValue = useMemo(
    () => ({ open: isOpen, value, itemId, disabled: isDisabled }),
    [isOpen, value, itemId, isDisabled]
  );

  return (
    <ItemContext.Provider value={contextValue}>
      <Primitive.div
        ref={forwardedRef}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={isDisabled}
        {...rest}
      />
    </ItemContext.Provider>
  );
});
Item.displayName = "Accordion.Item";

type HeaderElement = ElementRef<typeof Primitive.h2>;
type HeaderProps = PrimitiveH3Props;
const Header = forwardRef<HeaderElement, HeaderProps>((props, forwardedRef) => {
  const itemContext = useStrictContext(ItemContext);

  const isOpen = itemContext.open;
  const isDisabled = itemContext.disabled;

  return (
    <Primitive.h3
      ref={forwardedRef}
      data-state={isOpen ? "open" : "closed"}
      data-disabled={isDisabled}
      {...props}
    />
  );
});
Header.displayName = "Accordion.Header";

type TriggerElement = ElementRef<typeof Primitive.button>;
type TriggerProps = PrimitiveButtonProps;
const Trigger = forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  const { onClick, disabled, ...rest } = props;

  const valueContext = useStrictContext(ValueContext);
  const itemContext = useStrictContext(ItemContext);
  const triggerId = itemContext.itemId + "trigger";
  const panelId = itemContext.itemId + "panel";
  const isOpen = itemContext.open;

  const handleCilck = useCallbackRef(
    composePreventableEventHandlers(onClick, () => {
      if (isOpen) {
        valueContext.onItemClose(itemContext.value);
      } else {
        valueContext.onItemOpen(itemContext.value);
      }
    })
  );

  return (
    <Primitive.button
      id={triggerId}
      ref={forwardedRef}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-disabled={disabled}
      disabled={itemContext.disabled || disabled}
      data-disabled={itemContext.disabled || disabled}
      data-state={itemContext.open ? "open" : "closed"}
      onClick={handleCilck}
      {...rest}
    />
  );
});
Trigger.displayName = "Accordion.Trigger";

type PanelElement = ElementRef<typeof Primitive.div>;
interface PanelProps extends PrimitiveDivProps {
  forceMount?: boolean;
}
const Panel = forwardRef<PanelElement, PanelProps>((props, forwardedRef) => {
  const { forceMount = false, ...rest } = props;

  const itemContext = useStrictContext(ItemContext);
  const triggerId = itemContext.itemId + "trigger";
  const panelId = itemContext.itemId + "panel";

  const isOpen = itemContext.open;

  if (!forceMount && !isOpen) return null;
  return (
    <Primitive.div
      ref={forwardedRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      data-disabled={itemContext.disabled}
      data-state={itemContext.open ? "open" : "closed"}
      {...rest}
    />
  );
});
Panel.displayName = "Accordion.Panel";

export const Accordion = Object.assign(Root, { Item, Header, Trigger, Panel });

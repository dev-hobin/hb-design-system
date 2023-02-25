import React, { createContext, ElementRef, forwardRef, useCallback, useId, useMemo } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { useContollableState } from "../../hooks/useContollableState";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveH2Props = PrimitivePropsWithoutRef<typeof Primitive.h2>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

//
type RootImplProps = PrimitiveDivProps;
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

//
type ValueContextVaue = {
  value: string[];
  onItemOpen: (value: string) => void;
  onItemClose: (value: string) => void;
};
const ValueContext = createContext<ValueContextVaue | null>(null);
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
  if (props.type === "single") {
    return <SingleRootImpl ref={forwardedRef} {...props} />;
  } else {
    return <MultipleRootImpl ref={forwardedRef} {...props} />;
  }
});
Root.displayName = "Accordion";

const SingleRootImpl = forwardRef<RootElement, SingleRootProps>((props, forwardedRef) => {
  const {
    value: theirValue,
    onValueChange: theirHandler,
    defaultValue,
    collapsible = false,
    ...rest
  } = props;
  const [value, setValue] = useContollableState(theirValue, theirHandler, defaultValue);

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
  const [value = [], setValue] = useContollableState(theirValue, theirHandler, defaultValue);

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
  value: string;
  itemId: string;
};
const ItemContext = createContext<ItemContextValue | null>(null);
type ItemElement = ElementRef<typeof Primitive.div>;
interface ItemProps extends PrimitiveDivProps {
  value: string;
}
const Item = forwardRef<ItemElement, ItemProps>((props, forwardedRef) => {
  const { value, ...rest } = props;
  const itemId = useId();

  const contextValue = useMemo(() => ({ value, itemId }), [value, itemId]);

  return (
    <ItemContext.Provider value={contextValue}>
      <Primitive.div ref={forwardedRef} {...rest} />
    </ItemContext.Provider>
  );
});
Item.displayName = "Accordion.Item";

type HeaderElement = ElementRef<typeof Primitive.h2>;
type HeaderProps = PrimitiveH2Props;
const Header = forwardRef<HeaderElement, HeaderProps>((props, forwardedRef) => {
  return <Primitive.h2 ref={forwardedRef} {...props} />;
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
  const isExpanded = valueContext.value.includes(itemContext.value);

  const handleCilck = useCallbackRef(
    composePreventableEventHandlers(onClick, () => {
      if (isExpanded) {
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
      aria-expanded={isExpanded}
      aria-controls={panelId}
      aria-disabled={disabled}
      disabled={disabled}
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
  const valueContext = useStrictContext(ValueContext);
  const itemContext = useStrictContext(ItemContext);

  const triggerId = itemContext.itemId + "trigger";
  const panelId = itemContext.itemId + "panel";

  const isExpanded = valueContext.value.includes(itemContext.value);

  if (!forceMount && !isExpanded) return null;
  return (
    <Primitive.div
      ref={forwardedRef}
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      {...rest}
    />
  );
});
Panel.displayName = "Accordion.Panel";

export const Accordion = Object.assign(Root, { Item, Header, Trigger, Panel });

import React, { createContext, ElementRef, forwardRef, useEffect, useMemo, useState } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useContollableState } from "../../hooks/useContollableState";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Keys } from "../../utils/keyboard";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;
type PrimitiveSpanProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

type RootContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
};
const RootContext = createContext<RootContextValue | null>(null);
RootContext.displayName = "RadioGroup.RootContext";

type RootElement = ElementRef<typeof Primitive.div>;
interface RootProps extends PrimitiveDivProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
}
const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const {
    value: theirValue,
    onValueChange: theirHandler,
    defaultValue,
    disabled = false,
    ...rest
  } = props;
  const [value = "", setValue] = useContollableState(theirValue, theirHandler, defaultValue);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  useEffect(() => {
    if (container) {
      const getAllRadios = () => container.querySelectorAll('[role="radio"]');
      const focusHandler = () => {
        console.log("con");
        const allRadios = Array.from(getAllRadios()) as HTMLButtonElement[];
        const currentCheckedRadio = allRadios.find((btn) => btn.value === value);
        if (currentCheckedRadio) currentCheckedRadio.focus();
        else allRadios[0].focus();
      };
      const keyboardEventHandler = (ev: KeyboardEvent) => {
        const activeElement = document.activeElement;
        if (container.contains(activeElement)) {
          const allRadios = Array.from(getAllRadios()) as HTMLElement[];
          console.log("allRadios", allRadios);
          const currRadioIndex = allRadios.indexOf(activeElement as HTMLElement);
          console.log("currRadioIndex", currRadioIndex);
          if (currRadioIndex < 0) return;
          const lastIndex = allRadios.length - 1;
          switch (ev.code) {
            case Keys.ArrowRight:
              if (currRadioIndex === lastIndex) {
                allRadios[0]?.focus();
              } else {
                allRadios[currRadioIndex + 1]?.focus();
              }
              break;
            case Keys.ArrowLeft:
              if (currRadioIndex === 0) {
                allRadios[lastIndex]?.focus();
              } else {
                allRadios[currRadioIndex - 1]?.focus();
              }
              break;
            case Keys.ArrowDown:
              if (currRadioIndex === lastIndex) {
                allRadios[0]?.focus();
              } else {
                allRadios[currRadioIndex + 1]?.focus();
              }
              break;
            case Keys.ArrowUp:
              if (currRadioIndex === 0) {
                allRadios[lastIndex]?.focus();
              } else {
                allRadios[currRadioIndex - 1]?.focus();
              }
              break;
            default:
              break;
          }
        }
      };

      container.addEventListener("focus", focusHandler);
      container.addEventListener("keydown", keyboardEventHandler);

      return () => {
        container.removeEventListener("focus", focusHandler);
        container.removeEventListener("keydown", keyboardEventHandler);
      };
    }
  }, [container, value]);

  const contextValue = useMemo(
    () => ({ value, onValueChange: setValue, disabled }),
    [disabled, setValue, value]
  );

  return (
    <RootContext.Provider value={contextValue}>
      <Primitive.div ref={composedRef} role="radiogroup" tabIndex={disabled ? -1 : 0} {...rest} />
    </RootContext.Provider>
  );
});
Root.displayName = "RadioGroup";

type ItemContextValue = {
  value: string;
  checked: boolean;
  disabled: boolean;
};
const ItemContext = createContext<ItemContextValue | null>(null);
type ItemElement = ElementRef<typeof Primitive.button>;
interface ItemProps extends PrimitiveButtonProps {
  value: string;
  disabled?: boolean;
}
const Item = forwardRef<ItemElement, ItemProps>((props, forwardedRef) => {
  const { value, disabled = false, onClick, ...rest } = props;
  const rootContext = useStrictContext(RootContext);

  const isChecked = rootContext.value === value;
  const isDisabled = rootContext.disabled || disabled;

  const handleClick = useCallbackRef(
    composePreventableEventHandlers(onClick, () => rootContext.onValueChange(value))
  );

  const contextValue = useMemo(
    () => ({
      value,
      checked: isChecked,
      disabled: isDisabled,
    }),
    [isChecked, isDisabled, value]
  );

  return (
    <ItemContext.Provider value={contextValue}>
      <Primitive.button
        ref={forwardedRef}
        type="button"
        role="radio"
        value={value}
        disabled={isDisabled}
        tabIndex={isChecked ? 0 : -1}
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        data-disabled={isDisabled}
        onClick={handleClick}
        {...rest}
      />
    </ItemContext.Provider>
  );
});
Item.displayName = "RadioGroup.Item";

type IndicatorElement = ElementRef<typeof Primitive.span>;
type IndicatorProps = PrimitiveSpanProps;
const Indicator = forwardRef<IndicatorElement, IndicatorProps>((props, forwardedRef) => {
  const itemContext = useStrictContext(ItemContext);

  const isChecked = itemContext.checked;
  const isDisabled = itemContext.disabled;

  return (
    <Primitive.span
      ref={forwardedRef}
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={isDisabled}
      {...props}
    />
  );
});
Indicator.displayName = "RadioGroup.Indicator";

export const RadioGroup = Object.assign(Root, { Item, Indicator });

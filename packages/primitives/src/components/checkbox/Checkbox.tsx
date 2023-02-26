import React, {
  createContext,
  ElementRef,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";
import { useContollableState } from "../../hooks/useControllableState";
import useComposedRef from "../../hooks/useComposedRef";
import { useStrictContext } from "../../hooks/useStrictContext";
import { usePreviousValue } from "../../hooks/usePreviousValue";
import {
  composeEventHandlers,
  composePreventableEventHandlers,
} from "../../utils/composeEventHandlers";
import { useCallbackRef } from "../../hooks/useCallbackRef";

type CheckedState = boolean | "mixed";

type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;
type PrimitiveSpanProps = PrimitivePropsWithoutRef<typeof Primitive.span>;

const getState = (checked: CheckedState) => {
  if (checked === "mixed") return "mixed";
  if (checked) return "checked";
  else return "unchecked";
};

type RootContextValue = {
  checked: CheckedState;
  disabled: boolean;
};
const RootContext = createContext<RootContextValue | null>(null);
RootContext.displayName = "CheckboxRootContext";

type RootElement = ElementRef<typeof Primitive.button>;
interface RootProps extends Omit<PrimitiveButtonProps, "defaultChecked"> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}
const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const {
    checked: theirChecked,
    onCheckedChange: theirHandler,
    defaultChecked,
    value = "on",
    name,
    required = false,
    disabled = false,
    ...rest
  } = props;

  const [checked = false, setChecked] = useContollableState(
    theirChecked,
    theirHandler,
    defaultChecked
  );
  const initialChecked = useRef(checked);
  const previousChecked = usePreviousValue(checked);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasConsumerStoppedPropagationRef = React.useRef(false);

  const form = useRef<HTMLFormElement | null>(null);
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const composedRef = useComposedRef(
    forwardedRef,
    (node) => setButton(node),
    (node) => {
      form.current = node?.closest("form") ?? null;
    }
  );

  const handleClick = composeEventHandlers(props.onClick, (e) => {
    if (checked === "mixed" || !checked) {
      setChecked(true);
    } else {
      setChecked(false);
    }
    if (form.current) {
      hasConsumerStoppedPropagationRef.current = e.isPropagationStopped();
      if (!hasConsumerStoppedPropagationRef.current) e.stopPropagation();
    }
  });

  useEffect(() => {
    const form = button?.form;
    if (form) {
      const handler = () => setChecked(initialChecked.current);
      button.form.addEventListener("reset", handler);
      return () => form.removeEventListener("reset", handler);
    }
  }, [button, setChecked]);

  React.useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      ) as PropertyDescriptor;
      const setChecked = descriptor.set;

      if (previousChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles: !hasConsumerStoppedPropagationRef.current });
        input.indeterminate = checked === "mixed";
        setChecked.call(input, checked === "mixed" ? false : checked);
        input.dispatchEvent(event);
      }
    }
  }, [previousChecked, checked]);

  const contextValue = useMemo(
    () => ({
      checked,
      disabled,
    }),
    [checked, disabled]
  );

  return (
    <RootContext.Provider value={contextValue}>
      <Primitive.button
        ref={composedRef}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-required={required}
        data-state={getState(checked)}
        disabled={disabled}
        value={value}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        {...rest}
      />
      {!!form && (
        <input
          ref={inputRef}
          type="checkbox"
          tabIndex={-1}
          disabled={!!disabled}
          required={required}
          aria-hidden
          name={name}
          value={value}
          defaultChecked={checked === "mixed" ? false : checked}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: 0,
            height: 0,
            padding: 0,
            margin: 0,
          }}
        />
      )}
    </RootContext.Provider>
  );
});
Root.displayName = "Checkbox";

type IndicatorElement = ElementRef<typeof Primitive.span>;
type IndicatorProps = PrimitiveSpanProps;
const Indicator = forwardRef<IndicatorElement, IndicatorProps>((props, forwardedRef) => {
  const rootContext = useStrictContext(RootContext);

  return (
    <Primitive.span
      ref={forwardedRef}
      data-state={getState(rootContext.checked)}
      data-disabled={rootContext.disabled}
      {...props}
    />
  );
});
Indicator.displayName = "Checkbox.Indicator";

export const Checkbox = Object.assign(Root, { Indicator });

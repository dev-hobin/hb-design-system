import React, { ElementRef, forwardRef, useEffect, useRef, useState } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useContollableState } from "../../hooks/useContollableState";
import { usePreviousValue } from "../../hooks/usePreviousValue";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

type RootElement = ElementRef<typeof Primitive.button>;
interface RootProps extends PrimitiveButtonProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  required?: boolean;
  name?: string;
}

const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const {
    checked: theirChecked,
    onCheckedChange: theirCheckedHandler,
    defaultChecked = false,
    onClick,
    name,
    value = "on",
    disabled = false,
    required = false,
    ...rest
  } = props;
  const [container, setContainer] = useState<HTMLButtonElement | null>(null);
  const [checked, setChecked] = useContollableState(
    theirChecked,
    theirCheckedHandler,
    defaultChecked
  );
  const previousChecked = usePreviousValue(checked);
  const [isFormControlled, setIsFormControlled] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  const handleClick = useCallbackRef(
    composePreventableEventHandlers(onClick, (e) => {
      setChecked(!checked);
    })
  );

  useEffect(() => {
    if (container) {
      const form = container.closest("form");
      if (form) {
        setIsFormControlled(true);
      }
    }
  }, [container]);

  useEffect(() => {
    if (isFormControlled && inputRef.current) {
      const input = inputRef.current;
      const inputPrototype = globalThis.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputPrototype, "checked");
      const setter = descriptor?.set;
      if (setter && previousChecked !== checked) {
        const event = new Event("click", { bubbles: true });
        setter.call(input, checked);
        input.dispatchEvent(event);
      }
    }
  }, [inputRef, isFormControlled, checked, previousChecked]);

  return (
    <>
      <Primitive.button
        ref={composedRef}
        role="switch"
        aria-checked={!!checked}
        data-state={!!checked}
        data-disabled={!!disabled}
        onClick={handleClick}
        {...rest}
      />
      {isFormControlled && (
        <input
          ref={inputRef}
          type="checkbox"
          tabIndex={-1}
          disabled={!!disabled}
          required={required}
          aria-hidden="true"
          name={name}
          value={value}
          defaultChecked={!!checked}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: 1,
            height: 1,
            padding: 0,
            margin: 0,
          }}
        />
      )}
    </>
  );
});
Root.displayName = "Switch";

type GroupElement = ElementRef<typeof Primitive.div>;
type GroupProps = PrimitiveDivProps;
const Group = forwardRef<GroupElement, GroupProps>((props, ref) => {
  return <Primitive.div ref={ref} role="group" {...props} />;
});
Group.displayName = "Switch.Group";

export const Switch = Object.assign(Root, { Group });

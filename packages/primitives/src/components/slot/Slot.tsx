import React, { ReactElement } from "react";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { composeRefs } from "../../utils/composeRefs";

interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}
export const Slot = forwardRef<HTMLElement, SlotProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  const childCount = React.Children.count(children);

  if (childCount === 0 || childCount > 1) {
    console.warn("하나의 ReactElement만 넘길 수 있습니다.");
    return null;
  }
  if (!React.isValidElement(children)) {
    console.warn("유효한 ReactElement가 아닙니다.");
    return null;
  }
  if (children.type.toString().includes("fragment")) {
    console.warn("Fragment는 넘길 수 없습니다.");
    return null;
  }

  return (
    <SlotClone ref={forwardedRef} {...slotProps}>
      {children}
    </SlotClone>
  );
});
Slot.displayName = "Slot";

interface SlotCloneProps {
  children: ReactElement;
}
const SlotClone = forwardRef<unknown, SlotCloneProps>((props, forwardedRef) => {
  const { children, ...slotProps } = props;
  return React.cloneElement(children, {
    ...mergeProps(slotProps, children.props),
    ref: composeRefs(forwardedRef, (children as any).ref),
  });
});
SlotClone.displayName = "SlotClone";

const mergeProps = (parentProps: Record<string, any>, childProps: Record<string, any>) => {
  const overridedProps = { ...childProps };
  for (const propName in childProps) {
    const parentProp = parentProps[propName];
    const childProp = childProps[propName];

    if (parentProp && childProp) {
      if (propName === "style") {
        overridedProps["style"] = { ...(parentProp ?? {}), ...(childProp ?? {}) };
      } else if (propName === "className") {
        overridedProps["className"] = [parentProp, childProp].filter(Boolean).join(" ");
      } else if (propName.startsWith("on")) {
        overridedProps[propName] = (...args: unknown[]) => {
          childProp(...args);
          parentProp(...args);
        };
      }
    }
  }

  return { ...parentProps, ...overridedProps };
};

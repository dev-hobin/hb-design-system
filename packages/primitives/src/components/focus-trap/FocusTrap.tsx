import React, { ElementRef, forwardRef, MutableRefObject, useEffect, useRef } from "react";
import useComposedRef from "../../hooks/useComposedRef";
import { Keys } from "../../utils/keyboard";
import { focusable } from "../../utils/tabbable";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;

type RootElement = ElementRef<typeof Primitive.div>;
interface RootProps extends PrimitiveDivProps {
  enabled?: boolean;
  loop?: boolean;
  initialFocus?: MutableRefObject<HTMLElement | null>;
  returnFocus?: MutableRefObject<HTMLElement | null>;
}

const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const { loop = false, enabled = false, initialFocus, returnFocus, ...rest } = props;
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));
  const focusedElementBefore = useRef<HTMLElement>();

  useEffect(() => {
    if (enabled && container) {
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (activeElement) focusedElementBefore.current = activeElement;

      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        const focusableElements = focusable(container, false);
        focusableElements[0]?.focus();
      }

      const returnFocusElement = returnFocus?.current;
      return () => {
        if (returnFocusElement) {
          returnFocusElement.focus();
        } else if (focusedElementBefore.current) {
          focusedElementBefore.current.focus();
        }
      };
    }
  }, [container, enabled, initialFocus, returnFocus]);

  useEffect(() => {
    if (enabled && container && loop) {
      const keydownHandler = (ev: KeyboardEvent) => {
        switch (ev.key) {
          case Keys.Tab: {
            ev.preventDefault();
            ev.stopPropagation();
            const focusableElements = focusable(container, false);
            if (focusableElements.length === 0) return;
            if (focusableElements.length === 1) return focusableElements[0].focus();

            const activeElement = document.activeElement as HTMLElement;
            const idx = focusableElements.indexOf(activeElement);
            if (idx === -1) return;

            if (ev.shiftKey) {
              if (focusableElements[0] === activeElement) {
                focusableElements[focusableElements.length - 1].focus();
              } else {
                focusableElements[idx - 1].focus();
              }
            } else {
              if (focusableElements[focusableElements.length - 1] === activeElement) {
                focusableElements[0].focus();
              } else {
                focusableElements[idx + 1].focus();
              }
            }
            return;
          }
          default:
            return;
        }
      };
      container.addEventListener("keydown", keydownHandler);

      return () => container.removeEventListener("keydown", keydownHandler);
    }
  }, [container, enabled, loop]);

  return <Primitive.div ref={composedRef} {...rest} />;
});
Root.displayName = "FocusTrap";

export const FocusTrap = Object.assign(Root, {});

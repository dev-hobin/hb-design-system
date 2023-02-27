import React, {
  createContext,
  ElementRef,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  autoUpdate,
  flip,
  offset,
  OffsetOptions,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import useComposedRef from "../../hooks/useComposedRef";
import { useControllableState } from "../../hooks/useControllableState";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { FocusTrap } from "../focus-trap";
import { Portal } from "../portal";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";
import { useCallbackRef } from "../../hooks/useCallbackRef";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

type RootContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
  panelRef: MutableRefObject<HTMLDivElement | null>;
  panelId: string | undefined;
  registerPanel: (id: string) => void;
  unregisterPanel: () => void;
  anchor: HTMLElement | null;
  onAnchorChange: (el: HTMLElement | null) => void;
  nestedPanels: MutableRefObject<HTMLElement[]>;
  addNestedPanel: (panel: HTMLElement) => void;
  removeNestedPanel: (panel: HTMLElement) => void;
};
const RootContext = createContext<RootContextValue | null>(null);
RootContext.displayName = "PopoverRootContext";

interface RootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children?: ReactNode;
}
const Root = (props: RootProps) => {
  const { open: theirOpen, onOpenChange: theirHandler, defaultOpen, children } = props;
  const [open = false, setOpen] = useControllableState(theirOpen, theirHandler, defaultOpen);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelId, setPanelId] = useState<string>();
  const nestedPanels = useRef<HTMLElement[]>([]);

  const parentContext = useContext(RootContext);

  const addNestedPanel = useCallbackRef((panelEl: HTMLElement) => {
    if (parentContext) {
      parentContext.addNestedPanel(panelEl);
    }
    nestedPanels.current = [...nestedPanels.current, panelEl];
  });
  const removeNestedPanel = useCallbackRef((panelEl: HTMLElement) => {
    if (parentContext) {
      parentContext.removeNestedPanel(panelEl);
    }
    nestedPanels.current = [...nestedPanels.current].filter((p) => p !== panelEl);
  });

  const contextValue = useMemo(
    () => ({
      open,
      onOpenChange: setOpen,
      triggerRef,
      panelRef,
      panelId,
      registerPanel: setPanelId,
      unregisterPanel: () => setPanelId(undefined),
      anchor,
      onAnchorChange: setAnchor,
      nestedPanels,
      addNestedPanel,
      removeNestedPanel,
    }),
    [open, setOpen, panelId, anchor, nestedPanels, addNestedPanel, removeNestedPanel]
  );
  return <RootContext.Provider value={contextValue}>{children}</RootContext.Provider>;
};
Root.displayName = "Popover";

type AnchorElement = ElementRef<typeof Primitive.div>;
type AnchorProps = PrimitiveDivProps;
const Anchor = forwardRef<AnchorElement, AnchorProps>((props, forwardedRef) => {
  const anchorRef = useRef<AnchorElement>(null);
  const composedRef = useComposedRef(forwardedRef, anchorRef);

  const { onAnchorChange } = useStrictContext(RootContext);

  useEffect(() => {
    onAnchorChange(anchorRef.current);
  });

  return <Primitive.div ref={composedRef} {...props} />;
});
Anchor.displayName = "Popover.Anchor";

type TriggerElement = ElementRef<typeof Primitive.button>;
type TriggerProps = PrimitiveButtonProps;
const Trigger = forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  const { onClick, id, ...rest } = props;
  const internalId = useId();
  const triggerId = id || internalId;
  const { open, panelId, onOpenChange } = useStrictContext(RootContext);

  const handleClick = composePreventableEventHandlers(onClick, () => onOpenChange(true));

  return (
    <Primitive.button
      id={triggerId}
      ref={forwardedRef}
      aria-haspopup="dialog"
      aria-controls={panelId}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={handleClick}
      {...rest}
    />
  );
});
Trigger.displayName = "Popover.Trigger";

type PanelElement = ElementRef<typeof Primitive.div>;
interface PanelProps extends PrimitiveDivProps {
  forceMount?: boolean;
  initialFocus?: MutableRefObject<HTMLElement | null>;
  returnFocus?: MutableRefObject<HTMLElement | null>;
  offsetOptions?: OffsetOptions;
  placement?: Placement;
}
const Panel = forwardRef<PanelElement, PanelProps>((props, forwardedRef) => {
  const {
    id,
    forceMount = false,
    initialFocus,
    returnFocus,
    offsetOptions,
    placement,
    style,
    ...rest
  } = props;
  const internalId = useId();
  const panelId = id || internalId;
  const {
    open,
    onOpenChange,
    panelRef,
    triggerRef,
    registerPanel,
    unregisterPanel,
    anchor,
    nestedPanels,
    addNestedPanel,
    removeNestedPanel,
  } = useStrictContext(RootContext);

  const { x, y, reference, floating, strategy } = useFloating({
    open: open,
    placement: placement || "right",
    middleware: [offset(offsetOptions), shift(), flip()],
    whileElementsMounted: autoUpdate,
  });

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRef(
    forwardedRef,
    (node) => setContainer(node),
    panelRef,
    floating
  );

  useEffect(() => {
    reference(anchor);
  }, [anchor, reference]);

  useEffect(() => {
    if (container) {
      panelRef.current = container;
      registerPanel(panelId);
      addNestedPanel(container);

      return () => {
        panelRef.current = null;
        unregisterPanel();
        removeNestedPanel(container);
      };
    }
  }, [
    addNestedPanel,
    container,
    panelId,
    panelRef,
    registerPanel,
    removeNestedPanel,
    unregisterPanel,
  ]);

  useOutsideClick(
    [...nestedPanels.current, triggerRef],
    (e) => {
      const target = e.target;
      if (
        target instanceof Element &&
        nestedPanels.current.some((panelEl) => panelEl.contains(target))
      ) {
        return;
      }
      onOpenChange(false);
    },
    open
  );

  if (!open && !forceMount) return null;
  return (
    <FocusTrap asChild enabled={open} loop initialFocus={initialFocus} returnFocus={returnFocus}>
      <Primitive.div
        id={panelId}
        ref={composedRef}
        role="dialog"
        data-state={open ? "open" : "closed"}
        tabIndex={-1}
        style={{
          position: strategy,
          left: 0,
          top: 0,
          transform: `translate3d(${Math.round(x ?? 0)}px, ${Math.round(y ?? 0)}px, 0)`,
          minWidth: "max-content",
          ...style,
        }}
        dir={props.dir}
        {...rest}
      />
    </FocusTrap>
  );
});
Panel.displayName = "Popover.Panel";

type CloseElement = ElementRef<typeof Primitive.button>;
type CloseProps = PrimitiveButtonProps;
const Close = forwardRef<CloseElement, CloseProps>((props, forwardedRef) => {
  const { onClick, ...rest } = props;
  const { onOpenChange } = useStrictContext(RootContext);

  const handleClick = composePreventableEventHandlers(onClick, () => onOpenChange(false));

  return <Primitive.button ref={forwardedRef} onClick={handleClick} {...rest} />;
});
Close.displayName = "Popover.Close";

export const Popover = Object.assign(Root, { Trigger, Portal, Anchor, Panel, Close });

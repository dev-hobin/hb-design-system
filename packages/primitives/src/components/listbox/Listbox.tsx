import {
  autoUpdate,
  flip,
  offset,
  OffsetOptions,
  Placement,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import React, {
  createContext,
  ReactNode,
  useRef,
  useState,
  useMemo,
  ElementRef,
  forwardRef,
  useEffect,
  useId,
  RefObject,
  useCallback,
  useReducer,
  createRef,
} from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useControllableState } from "../../hooks/useControllableState";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Keys } from "../../utils/keyboard";
import { FocusTrap } from "../focus-trap";
import { Portal } from "../portal";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveSpanProps = PrimitivePropsWithoutRef<typeof Primitive.span>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

type Item = {
  ref: RefObject<HTMLElement>;
  info: {
    id: string;
    value: string;
    textValue: string;
    selected: boolean;
    active: boolean;
    disabled: boolean;
  };
};
enum ListboxAction {
  Open,
  Close,
  RegisterTrigger,
  UnregisterTrigger,
  RegisterAnchor,
  UnregisterAnchor,
  RegisterPanel,
  UnregisterPanel,
  RegisterItem,
  UnregisterItem,
  SelectItem,
}
type ListboxState = {
  open: boolean;
  trigger: RefObject<HTMLElement> | null;
  anchor: RefObject<HTMLElement> | null;
  panel: RefObject<HTMLElement> | null;
  items: Item[];
};
type ListboxActions =
  | { type: ListboxAction.Open }
  | { type: ListboxAction.Close }
  | { type: ListboxAction.RegisterTrigger; payload: RefObject<HTMLElement> }
  | { type: ListboxAction.UnregisterTrigger }
  | { type: ListboxAction.RegisterAnchor; payload: RefObject<HTMLElement> }
  | { type: ListboxAction.UnregisterAnchor }
  | { type: ListboxAction.RegisterPanel; payload: RefObject<HTMLElement> }
  | { type: ListboxAction.UnregisterPanel }
  | { type: ListboxAction.RegisterItem; payload: Item }
  | { type: ListboxAction.UnregisterItem; payload: Item };

const listboxReducer = (state: ListboxState, action: ListboxActions) => {
  switch (action.type) {
    case ListboxAction.Open: {
      return { ...state, open: true };
    }
    case ListboxAction.Close: {
      return { ...state, open: false };
    }
    case ListboxAction.RegisterTrigger: {
      const trigger = action.payload;
      return { ...state, trigger };
    }
    case ListboxAction.UnregisterTrigger: {
      return { ...state, trigger: null };
    }
    case ListboxAction.RegisterAnchor: {
      const anchor = action.payload;
      return { ...state, anchor };
    }
    case ListboxAction.UnregisterAnchor: {
      return { ...state, anchor: null };
    }
    case ListboxAction.RegisterPanel: {
      const panel = action.payload;
      console.log("panel in reducer", panel);
      return { ...state, panel };
    }
    case ListboxAction.UnregisterPanel: {
      return { ...state, panel: null };
    }
    case ListboxAction.RegisterItem: {
      const item = action.payload;
      return { ...state, items: [...state.items, item] };
    }
    case ListboxAction.UnregisterItem: {
      const item = action.payload;
      const items = state.items.slice().filter((it) => it !== item);
      return { ...state, items };
    }
    default:
      return state;
  }
};

type CollectionContextValue = {
  itemMap: Map<
    RefObject<ItemElement>,
    {
      ref: RefObject<ItemElement>;
      id: string;
      value: string;
      textValue: string;
    }
  >;
};
const CollectionContext = createContext<CollectionContextValue | null>(null);
const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const itemMap = useRef<CollectionContextValue["itemMap"]>(new Map()).current;

  const contextValue = useMemo(() => ({ itemMap }), [itemMap]);

  return <CollectionContext.Provider value={contextValue}>{children}</CollectionContext.Provider>;
};
function useCollection() {
  const context = useStrictContext(CollectionContext);
  const itemMap = context.itemMap;

  const getItems = useCallback(() => {
    const itemMap = context.itemMap;
    const items = Array.from(itemMap.values());

    return items;
  }, [context.itemMap]);

  return { itemMap, getItems };
}

type ListboxDataContextValue = ListboxState;
const ListboxDataContext = createContext<ListboxDataContextValue | null>(null);
ListboxDataContext.displayName = "ListboxDataContext";

type ListboxActionContextValue = {
  openListbox: () => void;
  closeListbox: () => void;
  registerTrigger: (trigger: RefObject<HTMLElement>) => void;
  unregisterTrigger: () => void;
  registerAnchor: (anchor: RefObject<HTMLElement>) => void;
  unregisterAnchor: () => void;
  registerPanel: (panel: RefObject<HTMLElement>) => void;
  unregisterPanel: () => void;
  registerItem: (item: Item) => void;
  unregisterItem: (item: Item) => void;
};
const ListboxActionContext = createContext<ListboxActionContextValue | null>(null);
ListboxActionContext.displayName = "ListboxActionContext";

interface RootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children?: ReactNode;
}
const Root = (props: RootProps) => {
  const {
    open: theirOpen,
    onOpenChange: theirOpenHandler,
    value: theirValue,
    onValueChange: theirValueChange,
    defaultValue,
    children,
  } = props;
  const [open = false, setOpen] = useControllableState(theirOpen, theirOpenHandler);
  const [value = "", setValue] = useControllableState(theirValue, theirValueChange, defaultValue);
  const [state, dispatch] = useReducer(listboxReducer, {
    open: open,
    trigger: null,
    anchor: null,
    panel: null,
    items: [],
  });
  // const [panelId, setPanelId] = useState<string>();

  console.log("state", state);

  const openListbox = useCallbackRef(() => {
    setOpen(true);
    dispatch({ type: ListboxAction.Open });
  });
  const closeListbox = useCallbackRef(() => {
    setOpen(false);
    dispatch({ type: ListboxAction.Close });
  });
  const registerTrigger = useCallbackRef((trigger: RefObject<HTMLElement>) =>
    dispatch({ type: ListboxAction.RegisterTrigger, payload: trigger })
  );
  const unregisterTrigger = useCallbackRef(() =>
    dispatch({ type: ListboxAction.UnregisterTrigger })
  );
  const registerAnchor = useCallbackRef((anchor: RefObject<HTMLElement>) =>
    dispatch({ type: ListboxAction.RegisterAnchor, payload: anchor })
  );
  const unregisterAnchor = useCallbackRef(() => dispatch({ type: ListboxAction.UnregisterAnchor }));
  const registerPanel = useCallbackRef((panel: RefObject<HTMLElement>) =>
    dispatch({ type: ListboxAction.RegisterPanel, payload: panel })
  );
  const unregisterPanel = useCallbackRef(() => dispatch({ type: ListboxAction.UnregisterPanel }));
  const registerItem = useCallbackRef((item: Item) =>
    dispatch({ type: ListboxAction.RegisterItem, payload: item })
  );
  const unregisterItem = useCallbackRef((item: Item) =>
    dispatch({ type: ListboxAction.UnregisterItem, payload: item })
  );

  const listboxData = useMemo(
    () => ({
      open: state.open,
      trigger: state.trigger,
      anchor: state.anchor,
      panel: state.panel,
      items: state.items,
    }),
    [state.anchor, state.items, state.open, state.panel, state.trigger]
  );
  const listboxAction = useMemo(
    () => ({
      openListbox,
      closeListbox,
      registerTrigger,
      unregisterTrigger,
      registerAnchor,
      unregisterAnchor,
      registerPanel,
      unregisterPanel,
      registerItem,
      unregisterItem,
    }),
    [
      openListbox,
      closeListbox,
      registerTrigger,
      unregisterTrigger,
      registerAnchor,
      unregisterAnchor,
      registerPanel,
      unregisterPanel,
      registerItem,
      unregisterItem,
    ]
  );

  return (
    <CollectionProvider>
      <ListboxActionContext.Provider value={listboxAction}>
        <ListboxDataContext.Provider value={listboxData}>{children}</ListboxDataContext.Provider>
      </ListboxActionContext.Provider>
    </CollectionProvider>
  );
};
Root.displayName = "Listbox";

type AnchorElement = ElementRef<typeof Primitive.div>;
type AnchorProps = PrimitiveDivProps;
const Anchor = forwardRef<AnchorElement, AnchorProps>((props, forwardedRef) => {
  const anchorRef = useRef<AnchorElement>(null);
  const composedRef = useComposedRef(forwardedRef, anchorRef);

  const { registerAnchor, unregisterAnchor } = useStrictContext(ListboxActionContext);

  useEffect(() => {
    if (anchorRef.current) {
      registerAnchor(anchorRef);
      return () => unregisterAnchor();
    }
  });

  return <Primitive.div ref={composedRef} {...props} />;
});
Anchor.displayName = "Listbox.Anchor";

type TriggerElement = ElementRef<typeof Primitive.button>;
type TriggerProps = PrimitiveButtonProps;
const Trigger = forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  const { onClick, id, ...rest } = props;

  const { open } = useStrictContext(ListboxDataContext);
  const { openListbox, closeListbox, registerTrigger, unregisterTrigger } =
    useStrictContext(ListboxActionContext);

  const internalId = useId();
  const triggerId = id || internalId;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRef(forwardedRef, triggerRef);

  const handleClick = composePreventableEventHandlers(onClick, () => {
    if (open) closeListbox();
    else openListbox();
  });

  useEffect(() => {
    if (triggerRef.current) {
      registerTrigger(triggerRef);

      return () => unregisterTrigger();
    }
  }, [registerTrigger, unregisterTrigger]);
  // const handleKeyDown = composePreventableEventHandlers(onKeyDown, (ev) => {
  //   switch (ev.key) {
  //     case Keys.Tab: {
  //       if (open) {
  //         ev.preventDefault();
  //         return;
  //       }
  //       break;
  //     }
  //     case Keys.Enter:
  //     case Keys.Space:
  //     case Keys.ArrowUp:
  //     case Keys.ArrowDown: {
  //       ev.preventDefault();
  //       if (!open) {
  //         onOpenChange(!open);
  //       }
  //       break;
  //     }
  //     default:
  //       break;
  //   }
  // });
  return (
    <Anchor asChild>
      <Primitive.button
        id={triggerId}
        ref={composedRef}
        aria-haspopup="listbox"
        // aria-controls={panelId}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={handleClick}
        // onKeyDown={handleKeyDown}
        {...rest}
      />
    </Anchor>
  );
});
Trigger.displayName = "Listbox.Trigger";

type ValueElement = ElementRef<typeof Primitive.span>;
interface ValueProps extends PrimitiveSpanProps {
  placeholder?: string;
}
const Value = forwardRef<ValueElement, ValueProps>((props, forwardedRef) => {
  const { placeholder, ...rest } = props;
  // const { value } = useStrictContext(RootContext);
  const { getItems } = useCollection();
  // const selectedItem = getItems().find((item) => item.value === value);

  console.log("ValueNode");
  return (
    <Primitive.span ref={forwardedRef} {...rest}>
      {/* {selectedItem?.textValue || placeholder} */}
    </Primitive.span>
  );
});
Value.displayName = "Listbox.Value";

type IconElement = ElementRef<typeof Primitive.span>;
type IconProps = PrimitiveSpanProps;
const Icon = forwardRef<IconElement, IconProps>((props, forwardedRef) => {
  return <Primitive.span ref={forwardedRef} {...props} />;
});
Icon.displayName = "Listbox.Icon";

type PanelElement = ElementRef<typeof Primitive.div>;
interface PanelProps extends PrimitiveDivProps {
  forceMount?: boolean;
  offsetOptions?: OffsetOptions;
  placement?: Placement;
}
const Panel = forwardRef<PanelElement, PanelProps>((props, forwardedRef) => {
  const {
    id,
    forceMount = false,
    offsetOptions,
    placement,
    style,
    onKeyDown,
    onFocus,
    ...rest
  } = props;
  const internalId = useId();
  const panelId = id || internalId;
  const panelRef = useRef<PanelElement>(null);
  const [container, setContainer] = useState<PanelElement | null>(null);
  const {
    // value,
    open,
    trigger,
    anchor,
  } = useStrictContext(ListboxDataContext);
  const { closeListbox, registerPanel, unregisterPanel } = useStrictContext(ListboxActionContext);
  // const [activeId, setActiveId] = useState<string>();

  const { x, y, reference, floating, strategy } = useFloating({
    open: open,
    placement: placement || "bottom",
    middleware: [offset(offsetOptions), shift(), flip()],
    whileElementsMounted: autoUpdate,
  });

  const composedRef = useComposedRef(
    forwardedRef,
    panelRef,
    (node) => setContainer(node),
    floating
  );

  // const { getItems } = useCollection();

  // const handleKeyDown = composePreventableEventHandlers(onKeyDown, (ev) => {
  //   switch (ev.key) {
  //     case Keys.Tab: {
  //       ev.preventDefault();
  //       break;
  //     }
  //     case Keys.ArrowDown: {
  //       ev.preventDefault();
  //       const items = getItems();
  //       if (items.length === 0) return;
  //       const activeItem = items.find((item) => item.id === activeId);
  //       if (!activeItem) return;
  //       const idx = items.indexOf(activeItem);
  //       if (idx === -1) return;
  //       if (idx === items.length - 1) return;
  //       setActiveId(items[idx + 1].id);
  //       break;
  //     }
  //     case Keys.ArrowUp: {
  //       ev.preventDefault();
  //       const items = getItems();
  //       if (items.length === 0) return;
  //       const activeItem = items.find((item) => item.id === activeId);
  //       if (!activeItem) return;
  //       const idx = items.indexOf(activeItem);
  //       if (idx === -1) return;
  //       if (idx === 0) return;
  //       setActiveId(items[idx - 1].id);
  //       break;
  //     }
  //   }
  // });

  useEffect(() => {
    if (anchor) {
      reference(anchor.current);
    }
  }, [anchor, reference]);

  useEffect(() => {
    if (container) {
      registerPanel(panelRef);
      return () => unregisterPanel();
    }
  }, [container, registerPanel, unregisterPanel]);

  // useEffect(() => {
  //   if (open) {
  //     if (value) {
  //       const selectedItem = getItems().find((item) => item.value === value);
  //       if (selectedItem) {
  //         setActiveId(selectedItem.id);
  //       }
  //     } else {
  //       setActiveId(getItems()?.[0].id);
  //     }
  //   }
  // }, [getItems, open, value]);

  useOutsideClick([panelRef, trigger], () => closeListbox(), open);

  if (!open && !forceMount) return null;
  return (
    <FocusTrap enabled returnFocus={trigger || undefined}>
      <Primitive.div
        id={panelId}
        ref={composedRef}
        role="listbox"
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
        // onKeyDown={handleKeyDown}
        dir={props.dir}
        // aria-activedescendant={activeId}
        {...rest}
      />
    </FocusTrap>
  );
});
Panel.displayName = "Listbox.Panel";

type GroupElement = ElementRef<typeof Primitive.div>;
type GroupProps = PrimitiveDivProps;
const Group = forwardRef<GroupElement, GroupProps>((props, forwardedRef) => {
  return <Primitive.div ref={forwardedRef} role="group" {...props} />;
});
Group.displayName = "Listbox.Group";

type ItemContextValue = {
  value: string;
};
const ItemContext = createContext<ItemContextValue | null>(null);
type ItemElement = ElementRef<typeof Primitive.div>;
interface ItemProps extends PrimitiveDivProps {
  value: string;
  textValue: string;
  disabled?: boolean;
}
const Item = forwardRef<ItemElement, ItemProps>((props, forwardedRef) => {
  const { id, value, textValue, disabled = false, children, ...rest } = props;
  const internalId = useId();
  const itemId = id || internalId;
  const internalRef = useRef<ItemElement>(null);
  const [container, setContainer] = useState<ItemElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, internalRef, (node) => setContainer(node));

  const { registerItem, unregisterItem } = useStrictContext(ListboxActionContext);

  // const collectionContext = useStrictContext(CollectionContext);

  // useEffect(() => {
  //   if (internalRef.current) {
  //     collectionContext.itemMap.set(internalRef, {
  //       ref: internalRef,
  //       value,
  //       textValue,
  //       id: itemId,
  //     });

  //     return () => {
  //       collectionContext.itemMap.delete(internalRef);
  //     };
  //   }
  // }, [collectionContext.itemMap, itemId, textValue, value]);

  useEffect(() => {
    if (container) {
      const item: Item = {
        ref: internalRef,
        info: { id: itemId, value, textValue, selected: false, active: false, disabled },
      };
      registerItem(item);

      return () => unregisterItem(item);
    }
  }, [container, disabled, itemId, registerItem, textValue, unregisterItem, value]);

  const contextValue = useMemo(() => ({ value }), [value]);

  return (
    <ItemContext.Provider value={contextValue}>
      <Primitive.div id={itemId} ref={composedRef} role="option" {...rest}>
        {children}
      </Primitive.div>
    </ItemContext.Provider>
  );
});
Item.displayName = "Listbox.Item";

type ItemIndicatorElement = ElementRef<typeof Primitive.span>;
type ItemIndicatorProps = PrimitiveSpanProps;
const ItemIndicator = forwardRef<ItemIndicatorElement, ItemIndicatorProps>(
  (props, forwardedRef) => {
    const { children, ...rest } = props;

    return (
      <Primitive.span ref={forwardedRef} {...rest}>
        {children}
      </Primitive.span>
    );
  }
);
ItemIndicator.displayName = "Listbox.ItemIndicator";

export const Listbox = Object.assign(Root, {
  Trigger,
  Value,
  Icon,
  Portal,
  Panel,
  Group,
  Item,
});

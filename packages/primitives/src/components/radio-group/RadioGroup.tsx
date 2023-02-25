import React, {
  createContext,
  ElementRef,
  forwardRef,
  KeyboardEvent,
  MutableRefObject,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useContollableState } from "../../hooks/useContollableState";
import { useLatestValue } from "../../hooks/useLatestValue";
import { useStrictContext } from "../../hooks/useStrictContext";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { Keys } from "../../utils/keyboard";
import { sortByDomNode } from "../../utils/sortByDomNode";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";
import { usePreviousValue } from "../../hooks/usePreviousValue";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;
type PrimitiveSpanProps = PrimitivePropsWithoutRef<typeof Primitive.button>;

//
type Item = {
  id: string;
  element: MutableRefObject<HTMLElement | null>;
  propsRef: MutableRefObject<{ value: string; disabled: boolean }>;
};
type RadioGroupState = {
  items: Item[];
};
enum Action {
  RegisterItem = "RegisterItem",
  UnregisterItem = "UnregisterItem",
}
type Actions =
  | { type: Action.RegisterItem; payload: Item }
  | { type: Action.UnregisterItem; payload: { id: Item["id"] } };

const radioGroupReducer = (state: RadioGroupState, action: Actions) => {
  switch (action.type) {
    case Action.RegisterItem: {
      const item = action.payload;
      const nextItems = [...state.items, item];
      return { ...state, items: sortByDomNode(nextItems, (item) => item.element.current) };
    }
    case Action.UnregisterItem: {
      const items = state.items.slice();
      const idx = state.items.findIndex((item) => item.id === action.payload.id);
      if (idx === -1) return state;
      items.splice(idx, 1);
      return { ...state, items };
    }
    default:
      return state;
  }
};
//

type DataContextValue = {
  value: string;
  items: Item[];
  firstOption: Item | undefined;
  hasCheckedItem: boolean;
  disabled: boolean;
  required: boolean;
  formControlled: boolean;
  name: string | undefined;
};
const DataContext = createContext<DataContextValue | null>(null);
DataContext.displayName = "RadioGroupDataContext";

type ActionContextValue = {
  registerItem: (item: Item) => void;
  triggerChange: (nextValue: string) => boolean;
};
const ActionContext = createContext<ActionContextValue | null>(null);
ActionContext.displayName = "RadioGroupActionContext";

type RootContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
  required: boolean;
  name: string | undefined;
};
const RootContext = createContext<RootContextValue | null>(null);
RootContext.displayName = "RadioGroup.RootContext";

type RootElement = ElementRef<typeof Primitive.div>;
interface RootProps extends PrimitiveDivProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  defaultValue?: string;
  required?: boolean;
  name?: string;
}
const Root = forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const {
    value: theirValue,
    onValueChange: theirHandler,
    defaultValue,
    disabled = false,
    required = false,
    name,
    onKeyDown,
    ...rest
  } = props;
  const [state, dispatch] = useReducer(radioGroupReducer, { items: [] });

  const [value = "", setValue] = useContollableState(theirValue, theirHandler, defaultValue);
  const internalRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, internalRef, (node) => {
    formRef.current = node?.closest("form") ?? null;
  });
  const isFormControlled = !!formRef.current;

  const items = state.items;
  const firstOption = useMemo(() => {
    return items.find((item) => {
      if (item.propsRef.current.disabled) return false;
      return true;
    });
  }, [items]);
  const hasCheckedItem = useMemo(
    () => items.some((item) => item.propsRef.current.value === value),
    [items, value]
  );

  const registerItem = useCallbackRef((item: Item) => {
    dispatch({ type: Action.RegisterItem, payload: item });

    // cleanup
    return () => dispatch({ type: Action.UnregisterItem, payload: { id: item.id } });
  });
  const triggerChange = useCallbackRef((nextValue: string) => {
    if (disabled) return false;
    if (value === nextValue) return false;
    const nextItem = items.find((item) => item.propsRef.current.value === nextValue);
    if (nextItem?.propsRef.current.disabled) return false;

    setValue(nextValue);
    return true;
  });

  const radioGroupData = useMemo(
    () => ({
      value,
      firstOption,
      hasCheckedItem,
      disabled,
      items: state.items,
      required,
      name,
      formControlled: isFormControlled,
    }),
    [disabled, firstOption, hasCheckedItem, name, required, state.items, value, isFormControlled]
  );

  const radioGroupAction = useMemo(
    () => ({ registerItem, triggerChange }),
    [registerItem, triggerChange]
  );

  const handleKeyDownHandler = useCallbackRef(
    composePreventableEventHandlers(onKeyDown, (ev: KeyboardEvent<HTMLDivElement>) => {
      const container = internalRef.current;
      if (!container) return;

      const document = globalThis.document;
      const allRadios = items
        .filter((item) => item.propsRef.current.disabled === false)
        .map((item) => item.element.current) as HTMLElement[];
      const activeElement = document.activeElement as HTMLElement;

      if (!allRadios.includes(activeElement)) return;

      switch (ev.key) {
        case Keys.ArrowLeft:
        case Keys.ArrowUp: {
          ev.preventDefault();
          ev.stopPropagation();

          const idx = allRadios.indexOf(activeElement);
          if (idx === -1) return;

          const lastFocusableElement = allRadios[allRadios.length - 1];
          if (idx === 0) {
            lastFocusableElement.focus();
            const focusedItem = items.find((item) => item.element.current === lastFocusableElement);
            if (focusedItem) {
              triggerChange(focusedItem.propsRef.current.value);
            }
          } else {
            const focusedElement = allRadios[idx - 1];
            focusedElement.focus();

            const focusedItem = items.find((item) => item.element.current === focusedElement);
            if (focusedItem) {
              triggerChange(focusedItem.propsRef.current.value);
            }
          }
          return;
        }
        case Keys.ArrowRight:
        case Keys.ArrowDown: {
          ev.preventDefault();
          ev.stopPropagation();

          const idx = allRadios.indexOf(activeElement);
          if (idx === -1) return;

          const firstFocusableElement = allRadios[0];
          if (idx === allRadios.length - 1) {
            firstFocusableElement.focus();
            const focusedItem = items.find(
              (item) => item.element.current === firstFocusableElement
            );
            if (focusedItem) {
              triggerChange(focusedItem.propsRef.current.value);
            }
          } else {
            const focusedElement = allRadios[idx + 1];
            focusedElement.focus();

            const focusedItem = items.find((item) => item.element.current === focusedElement);
            if (focusedItem) {
              triggerChange(focusedItem.propsRef.current.value);
            }
          }
          return;
        }
        case Keys.Space: {
          ev.preventDefault();
          ev.stopPropagation();

          const currentFocusedElement = activeElement as HTMLElement;
          const currentFocusedItem = items.find(
            (item) => item.element.current === currentFocusedElement
          );
          if (currentFocusedItem) {
            triggerChange(currentFocusedItem.propsRef.current.value);
          }
          return;
        }
        default: {
          return;
        }
      }
    })
  );

  return (
    <ActionContext.Provider value={radioGroupAction}>
      <DataContext.Provider value={radioGroupData}>
        <Primitive.div
          ref={composedRef}
          role="radiogroup"
          onKeyDown={handleKeyDownHandler}
          {...rest}
        />
      </DataContext.Provider>
    </ActionContext.Provider>
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
  const internalId = useId();
  const { id = internalId, value, disabled = false, onClick, ...rest } = props;
  const radioGroupData = useStrictContext(DataContext);
  const radioGroupAction = useStrictContext(ActionContext);

  const internalRef = useRef<HTMLButtonElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, internalRef);
  const propsRef = useLatestValue({ value, disabled });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isFirstOption = radioGroupData.firstOption?.id === id;
  const isDisabled = radioGroupData.disabled || disabled;
  const isChecked = radioGroupData.value === value;
  const isFormControlled = radioGroupData.formControlled;
  const previousChecked = usePreviousValue(isChecked);

  const getTabIndex = () => {
    if (isDisabled) return -1;
    if (isChecked) return 0;
    if (!radioGroupData.hasCheckedItem && isFirstOption) return 0;
    return -1;
  };

  useEffect(
    () => radioGroupAction.registerItem({ id, element: internalRef, propsRef: propsRef }),
    [id, propsRef, radioGroupAction, props]
  );

  const handleClick = useCallbackRef(
    composePreventableEventHandlers(onClick, () => {
      if (!radioGroupAction.triggerChange(value)) return;
      internalRef.current?.focus();
    })
  );

  useEffect(() => {
    if (isFormControlled && inputRef.current) {
      const input = inputRef.current;
      const inputPrototype = globalThis.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(inputPrototype, "checked");
      const setter = descriptor?.set;
      if (setter && previousChecked !== isChecked) {
        const event = new Event("click", { bubbles: true });
        setter.call(input, isChecked);
        input.dispatchEvent(event);
      }
    }
  }, [inputRef, isFormControlled, isChecked, previousChecked]);

  const itemContextValue = useMemo(
    () => ({
      checked: isChecked,
      disabled: isDisabled,
      value,
    }),
    [isChecked, isDisabled, value]
  );

  return (
    <>
      <ItemContext.Provider value={itemContextValue}>
        <Primitive.button
          id={id}
          ref={composedRef}
          type="button"
          role="radio"
          value={value}
          disabled={isDisabled}
          tabIndex={getTabIndex()}
          aria-checked={isChecked}
          data-state={isChecked ? "checked" : "unchecked"}
          data-disabled={isDisabled}
          onClick={handleClick}
          {...rest}
        />
      </ItemContext.Provider>
      {isFormControlled && (
        <input
          ref={inputRef}
          type="radio"
          tabIndex={-1}
          disabled={!!disabled}
          required={radioGroupData.required}
          aria-hidden="true"
          name={radioGroupData.name}
          value={value}
          defaultChecked={!!isChecked}
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
    </>
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

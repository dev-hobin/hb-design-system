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
  useState,
} from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import useComposedRef from "../../hooks/useComposedRef";
import { useControllableState } from "../../hooks/useControllableState";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useStrictContext } from "../../hooks/useStrictContext";
import { StackProvider } from "../../internal/StackProvider";
import { composePreventableEventHandlers } from "../../utils/composeEventHandlers";
import { FocusTrap } from "../focus-trap/FocusTrap";
import { Portal } from "../portal";
import { Primitive, PrimitivePropsWithoutRef } from "../primitive";

type PrimitiveDivProps = PrimitivePropsWithoutRef<typeof Primitive.div>;
type PrimitiveButtonProps = PrimitivePropsWithoutRef<typeof Primitive.button>;
type PrimitiveH2Props = PrimitivePropsWithoutRef<typeof Primitive.h2>;
type PrimitiveParagraphProps = PrimitivePropsWithoutRef<typeof Primitive.p>;

type RootContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string | undefined;
  registerContent: (id: string) => void;
  unregisterContent: () => void;
  titleId: string | undefined;
  registerTitle: (id: string) => void;
  unregisterTitle: () => void;
  descriptionId: string | undefined;
  registerDescription: (id: string) => void;
  unregisterDescription: () => void;
  hasNestedDialogs: boolean;
  hasParentDialog: boolean;
};
const RootContext = createContext<RootContextValue | null>(null);

type RootProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
};
const Root = ({
  open: theirOpen,
  onOpenChange: theirHandler,
  defaultOpen = false,
  children,
}: RootProps) => {
  const [open = false, setOpen] = useControllableState(theirOpen, theirHandler, defaultOpen);
  const [contentId, setContentId] = useState<string>();
  const [titleId, setTitleId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  const [nestedCount, setNestedCount] = useState<number>(0);

  const hasNestedDialogs = nestedCount > 1;
  const hasParentDialog = useContext(RootContext) !== null;

  const contextValue = useMemo(
    () => ({
      open,
      onOpenChange: setOpen,
      contentId,
      titleId,
      descriptionId,
      registerContent: setContentId,
      registerTitle: setTitleId,
      registerDescription: setDescriptionId,
      unregisterContent: () => setDescriptionId(undefined),
      unregisterTitle: () => setDescriptionId(undefined),
      unregisterDescription: () => setDescriptionId(undefined),
      hasNestedDialogs,
      hasParentDialog,
    }),
    [open, setOpen, contentId, titleId, descriptionId, hasNestedDialogs, hasParentDialog]
  );

  return (
    <StackProvider
      enabled={open}
      onUpdate={useCallbackRef((message) => {
        if (message === "plus") {
          setNestedCount((count) => count + 1);
        } else {
          setNestedCount((count) => count - 1);
        }
      })}
    >
      <RootContext.Provider value={contextValue}>{children}</RootContext.Provider>
    </StackProvider>
  );
};
Root.displayName = "Dialog";

type TriggerElement = ElementRef<typeof Primitive.button>;
type TriggerProps = PrimitiveButtonProps;
const Trigger = forwardRef<TriggerElement, TriggerProps>((props, forwardedRef) => {
  const { onClick, id, ...rest } = props;
  const internalId = useId();
  const triggerId = id || internalId;
  const { open, contentId, onOpenChange } = useStrictContext(RootContext);

  const handleClick = composePreventableEventHandlers(onClick, () => onOpenChange(true));

  return (
    <Primitive.button
      id={triggerId}
      ref={forwardedRef}
      aria-haspopup="dialog"
      aria-controls={contentId}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={handleClick}
      {...rest}
    />
  );
});
Trigger.displayName = "Dialog.Trigger";

type OverlayElement = ElementRef<typeof Primitive.div>;
interface OverlayProps extends PrimitiveDivProps {
  forceMount?: boolean;
}
const Overlay = forwardRef<OverlayElement, OverlayProps>((props, forwardedRef) => {
  const { forceMount = false, ...rest } = props;
  const { open } = useStrictContext(RootContext);

  if (!open && !forceMount) return null;
  return <Primitive.div ref={forwardedRef} {...rest} />;
});
Overlay.displayName = "Dialog.Overlay";

type ContentElement = ElementRef<typeof Primitive.div>;
interface ContentProps extends PrimitiveDivProps {
  forceMount?: boolean;
  initialFocus?: MutableRefObject<HTMLElement | null>;
  returnFocus?: MutableRefObject<HTMLElement | null>;
}
const Content = forwardRef<ContentElement, ContentProps>((props, forwardedRef) => {
  const { id, forceMount = false, initialFocus, returnFocus, ...rest } = props;
  const internalId = useId();
  const contentId = id || internalId;

  const {
    open,
    registerContent,
    unregisterContent,
    titleId,
    descriptionId,
    onOpenChange,
    hasNestedDialogs,
    hasParentDialog,
  } = useStrictContext(RootContext);

  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  useEffect(() => {
    if (container) {
      registerContent(contentId);
      return () => unregisterContent();
    }
  }, [container, contentId, registerContent, unregisterContent]);

  useOutsideClick([container], () => onOpenChange(false), open && !hasNestedDialogs);
  useScrollLock(container, !hasParentDialog);

  if (!open && !forceMount) return null;
  return (
    <FocusTrap asChild enabled={open} loop returnFocus={returnFocus}>
      <Primitive.div
        id={contentId}
        ref={composedRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        data-state={open ? "open" : "closed"}
        tabIndex={-1}
        {...rest}
      />
    </FocusTrap>
  );
});
Content.displayName = "Dialog.Content";

type TitleElement = ElementRef<typeof Primitive.h2>;
type TitleProps = PrimitiveH2Props;
const Title = forwardRef<TitleElement, TitleProps>((props, forwardedRef) => {
  const { id, ...rest } = props;
  const [container, setContainer] = useState<HTMLHeadingElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  const internalId = useId();
  const titleId = id || internalId;
  const { registerTitle, unregisterTitle } = useStrictContext(RootContext);

  useEffect(() => {
    if (container) {
      registerTitle(titleId);
      return () => unregisterTitle();
    }
  }, [container, registerTitle, titleId, unregisterTitle]);

  return <Primitive.h2 ref={composedRef} {...rest} />;
});
Title.displayName = "Dialog.Title";

type DescriptionElement = ElementRef<typeof Primitive.p>;
type DescriptionProps = PrimitiveParagraphProps;
const Description = forwardRef<DescriptionElement, DescriptionProps>((props, forwardedRef) => {
  const { id, ...rest } = props;
  const [container, setContainer] = useState<HTMLParagraphElement | null>(null);
  const composedRef = useComposedRef(forwardedRef, (node) => setContainer(node));

  const internalId = useId();
  const titleId = id || internalId;
  const { registerDescription, unregisterDescription } = useStrictContext(RootContext);

  useEffect(() => {
    if (container) {
      registerDescription(titleId);
      return () => unregisterDescription();
    }
  }, [container, registerDescription, titleId, unregisterDescription]);

  return <Primitive.p ref={composedRef} {...rest} />;
});
Description.displayName = "Dialog.Description";

type CloseElement = ElementRef<typeof Primitive.button>;
type CloseProps = PrimitiveButtonProps;
const Close = forwardRef<CloseElement, CloseProps>((props, forwardedRef) => {
  const { onClick } = props;
  const { onOpenChange } = useStrictContext(RootContext);
  const handleClick = composePreventableEventHandlers(onClick, () => onOpenChange(false));

  return <Primitive.button ref={forwardedRef} onClick={handleClick} {...props} />;
});
Close.displayName = "Dialog.Close";

export const Dialog = Object.assign(Root, {
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
});

import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  container?: Element | DocumentFragment | null;
  key?: string | null | undefined;
}
export const Portal = ({ children, container = globalThis?.document?.body, key }: PortalProps) => {
  return container ? createPortal(children, container, key) : null;
};

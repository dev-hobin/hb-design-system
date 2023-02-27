import { useEffect } from "react";
import { useLatestValue } from "./useLatestValue";

export const useDocumentEvent = <TType extends keyof DocumentEventMap>(
  type: TType,
  listener: (ev: DocumentEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions,
  enabled = true
) => {
  const listenerRef = useLatestValue(listener);

  useEffect(() => {
    if (enabled) {
      const handler = (ev: DocumentEventMap[TType]) => {
        listenerRef.current(ev);
      };

      document.addEventListener(type, handler, options);
      return () => document.removeEventListener(type, handler, options);
    }
  }, [listenerRef, options, type, enabled]);
};

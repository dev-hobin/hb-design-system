import { useEffect } from "react";
import { useLatestValue } from "./useLatestValue";

export const useDocumentEvent = <TType extends keyof DocumentEventMap>(
  type: TType,
  listener: (ev: DocumentEventMap[TType]) => any,
  options?: boolean | AddEventListenerOptions
) => {
  const listenerRef = useLatestValue(listener);

  useEffect(() => {
    const handler = (ev: DocumentEventMap[TType]) => {
      listenerRef.current(ev);
    };

    document.addEventListener(type, handler, options);
    return () => document.addEventListener(type, handler, options);
  }, [listenerRef, options, type]);
};

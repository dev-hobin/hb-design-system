import { MutableRefObject, useRef } from "react";
import { useDocumentEvent } from "./useDocumentEvent";
import { useLatestValue } from "./useLatestValue";

type Container = MutableRefObject<HTMLElement | null> | HTMLElement | null;
export const useOutsideClick = (
  containers: Container[],
  cb: (event: MouseEvent, target: HTMLElement) => void,
  enabled = true
) => {
  const enabledRef = useLatestValue(enabled);
  const initialClickTarget = useRef<EventTarget | null>(null);

  const handler = <E extends MouseEvent>(ev: E) => {
    if (!enabledRef.current) return;
    if (ev.defaultPrevented) return;
    if (!initialClickTarget.current) return;
    const target = initialClickTarget.current as HTMLElement;

    for (const container of containers) {
      if (!container) continue;
      const node = container instanceof HTMLElement ? container : container.current;
      if (node?.contains(target)) return;
    }
    return cb(ev, target);
  };

  useDocumentEvent(
    "mousedown",
    (ev) => {
      if (enabledRef.current) {
        initialClickTarget.current = ev.composedPath?.()?.[0] || ev.target;
      }
    },
    true,
    enabledRef.current
  );

  useDocumentEvent(
    "click",
    (ev) => {
      if (!initialClickTarget.current) return;
      handler(ev);
      initialClickTarget.current = null;
    },
    true,
    enabledRef.current
  );
};

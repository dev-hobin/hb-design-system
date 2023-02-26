import { MutableRefObject, useEffect } from "react";

type Container = MutableRefObject<HTMLElement | null> | HTMLElement | null;
export const useScrollLock = (container: Container, enabled = false) => {
  useEffect(() => {
    if (!container) return;
    const base = container instanceof HTMLElement ? container : container.current;
    if (base && enabled) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [container, enabled]);
};

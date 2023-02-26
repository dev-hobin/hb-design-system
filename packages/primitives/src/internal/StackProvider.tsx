import React, { createContext, ReactNode, useContext, useEffect } from "react";
import { useCallbackRef } from "../hooks/useCallbackRef";

type Update = (message: "plus" | "minus") => void;
type StackContextValue = Update;
const StackContext = createContext<StackContextValue>(() => undefined);

export const StackProvider = ({
  children,
  onUpdate,
  enabled = true,
}: {
  children: ReactNode;
  onUpdate?: Update;
  enabled?: boolean;
}) => {
  const parentUpdate = useContext(StackContext);

  const update = useCallbackRef((...args: Parameters<Update>) => {
    onUpdate?.(...args);
    parentUpdate(...args);
  });

  useEffect(() => {
    if (enabled) {
      update("plus");

      return () => update("minus");
    }
  }, [enabled, update]);

  return <StackContext.Provider value={update}>{children}</StackContext.Provider>;
};

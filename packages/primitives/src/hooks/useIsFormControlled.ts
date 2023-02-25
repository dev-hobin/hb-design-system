import { useEffect, useState } from "react";

export const useIsFormControlled = (container: HTMLElement | null) => {
  const [isFormControlled, setIsFormControlled] = useState<boolean>(false);

  useEffect(() => {
    if (container) {
      const form = container.closest("form");
      if (form) {
        setIsFormControlled(true);
      }
    }
  }, [container]);

  return isFormControlled;
};

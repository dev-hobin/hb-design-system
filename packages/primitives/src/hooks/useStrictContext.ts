import { Context, useContext } from "react";

export const useStrictContext = <T>(context: Context<T>) => {
  const value = useContext(context);

  if (!value) {
    throw new Error(`${context.displayName ?? "Context"} 를 찾지 못했습니다.`);
  }

  return value;
};

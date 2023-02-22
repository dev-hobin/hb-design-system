import { useCallback } from "react";
import { useLatestValue } from "./useLatestValue";

/**
 * callback 함수가 항상 최신값을 가지고 있어야하고 함수의 변경에 따른 값의 변경에 의한 영향을 받고 싶지 않을 때 사용한다.
 */
export const useCallbackRef = <
  Func extends (...args: any[]) => any,
  Params extends any[] = Parameters<Func>,
  Return = ReturnType<Func>
>(
  callback: (...args: Params) => Return
) => {
  const cache = useLatestValue(callback);
  return useCallback((...args: Params) => cache.current(...args), [cache]);
};

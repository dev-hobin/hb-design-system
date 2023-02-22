import { useRef } from "react";

/**
 * value는 항상 최신값을 담고 있어야 하지만 값이 변함에 따라 사이드 이팩트가 다시 일어나지 않도록 하고 싶을 때 사용한다.
 *
 * - ref를 이용하여 참조가 변하지 않게 고정시켰기 때문에 dependency array에 담겨도 안전하다.
 */
export const useLatestValue = <T>(value: T) => {
  const cache = useRef<T>(value);
  cache.current = value;
  return cache;
};

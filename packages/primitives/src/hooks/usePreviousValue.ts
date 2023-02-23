import { useMemo, useRef } from "react";

/**
 * 값이 변하기 이전값이 필요할 때 사용한다.
 */
export const usePreviousValue = <TValue>(value: TValue) => {
  // 처음에는 현재값, 이전값 모두 처음 들어온 value로 설정한다.
  const cache = useRef({ value, previous: value });

  const previous = useMemo(() => {
    // 새로 들어온 값이 현재값과 다를 경우 이전값과 현재값을 업데이트한다.
    if (cache.current.value !== value) {
      cache.current.previous = cache.current.value;
      cache.current.value = value;
    }
    return cache.current.previous;
  }, [value]);

  return previous;
};

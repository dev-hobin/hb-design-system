import { useState } from "react";
import { useCallbackRef } from "./useCallbackRef";

/**
 * 컴포넌트 내부에서 자체적으로 관리하는 상태에 대한 제어권을 외부에 주기 위해서 사용한다.
 */
export const useControllableState = <TValue>(
  value: TValue | undefined,
  onValueChange?: (value: TValue) => void,
  defaultValue?: TValue
) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  // 외부에서 컨트롤 하려고 하는지에 대한 구분
  const isControlled = value !== undefined;

  const handleValueChange = useCallbackRef((value) => {
    // 외부에서 컨트롤 하는 경우로 외부에서 넣어주는 핸들러 사용
    if (isControlled) return onValueChange?.(value);
    // 내부에서 관리하는 값이라면 내부에서 관리하는 값 업데이트
    else {
      setInternalValue(value);
      // 외부에서 관리하려는 의도는 없으나 값이 변경될 때 추가로 실행하고 싶은 이벤트가 있을 경우 이벤트 핸들러만 넣어줄 수 있는데 이 경우를 처리한다.
      return onValueChange?.(value);
    }
  });

  return [
    isControlled ? (value as TValue) : internalValue,
    // 컴포넌트 내부에서 사용할 떄 onValueChange를 외부에서 넘겼는지는 중요하지 않고 내부에서 알아서 관리하는게 확실하므로 NonNullable 로 생각한다.
    handleValueChange as NonNullable<typeof onValueChange>,
  ] as const;
};

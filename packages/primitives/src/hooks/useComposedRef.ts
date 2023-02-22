import { composeRefs, RefOrInvalid } from "../utils/composeRefs";
import { useCallbackRef } from "./useCallbackRef";
import { useLatestValue } from "./useLatestValue";

const useComposedRef = <Value>(...refs: RefOrInvalid<Value>[]) => {
  const cache = useLatestValue(refs);
  return useCallbackRef(composeRefs(...cache.current));
};

export default useComposedRef;

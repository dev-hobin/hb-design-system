import React from "react";

type RefOrUndefined<Value> =
  | ((instance: Value | null) => void)
  | React.MutableRefObject<Value>
  | undefined
  | null;

const setRef = <Value>(ref: RefOrUndefined<Value>, value: Value) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

export const composeRefs = <Value>(...refs: RefOrUndefined<Value>[]) => {
  return (instance: Value) => refs.forEach((ref) => setRef(ref, instance));
};

import React from "react";

export type RefOrInvalid<Value> =
  | ((instance: Value | null) => void)
  | React.MutableRefObject<Value | null>
  | undefined
  | null;

const setRef = <Value>(ref: RefOrInvalid<Value>, value: Value) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
};

export const composeRefs = <Value>(...refs: RefOrInvalid<Value>[]) => {
  return (instance: Value) => refs.forEach((ref) => setRef(ref, instance));
};

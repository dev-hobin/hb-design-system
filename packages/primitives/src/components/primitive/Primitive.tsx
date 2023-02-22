import React, {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  ForwardRefExoticComponent,
} from "react";
import { Slot } from "../slot";

const BASE_ELEMENTS = [
  "a",
  "button",
  "div",
  "h2",
  "h3",
  "img",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul",
] as const;

// 모든 Primitive 컴포넌트에 asChild 속성 추가
type PrimitivePropsWithRef<TElement extends ElementType> = ComponentPropsWithRef<TElement> & {
  asChild?: boolean;
};
type PrimitivePropsWithoutRef<TElement extends ElementType> = ComponentPropsWithoutRef<TElement> & {
  asChild?: boolean;
};
type PrimitiveRef<TElement extends ElementType> = PrimitivePropsWithRef<TElement>["ref"];

// Primitive 컴포넌트를 기본으로 하는 ForwardRefComponent
type PrimitiveForwardRefComponent<TElement extends React.ElementType> = ForwardRefExoticComponent<
  PrimitivePropsWithRef<TElement>
>;
// Primitive 레코드에 들어갈 value에 대한 타입 선언
type Primitives = {
  [TElement in typeof BASE_ELEMENTS[number]]: PrimitiveForwardRefComponent<TElement>;
};

const Primitive = BASE_ELEMENTS.reduce((primitives, base) => {
  // asChild prop이 true라면 Slot 컴포넌트를 사용하는 역할을 한다.
  const PrimitiveComponent = forwardRef<
    PrimitiveRef<typeof base>,
    PrimitivePropsWithoutRef<typeof base>
  >((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp: any = asChild ? Slot : base;
    return <Comp {...primitiveProps} ref={forwardedRef} />;
  });
  PrimitiveComponent.displayName = `Primitive.${base}`;

  return { ...primitives, [base]: PrimitiveComponent };
}, {} as Primitives);

export type { PrimitivePropsWithoutRef, PrimitivePropsWithRef };
export { Primitive };

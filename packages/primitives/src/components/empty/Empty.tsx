import React, { HTMLAttributes } from "react";

type EmptyProps = HTMLAttributes<HTMLDivElement>;
export const Empty = ({ ...props }: EmptyProps) => {
  return <div {...props}>테스트</div>;
};

import React from "react";
import { Empty as PrimitiveEmpty } from "@hb-design-systems/primitives";
import styled from "styled-components";

const Background = styled.div``;

export const Empty = () => {
  return (
    <Background>
      <PrimitiveEmpty style={{ color: "blue" }} />
    </Background>
  );
};

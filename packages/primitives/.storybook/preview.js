import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle``;

const withGlobalStyle = (Story) => (
  <>
    <GlobalStyle />
    <Story />
  </>
);

export const parameters = {
  layout: "fullscreen",
};

export const decorators = [withGlobalStyle];

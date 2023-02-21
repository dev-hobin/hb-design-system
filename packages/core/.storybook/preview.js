import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle``;

const withGlobalStyle = (Story) => (
  <>
    <GlobalStyle />
    <Story />
  </>
);

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [withGlobalStyle];

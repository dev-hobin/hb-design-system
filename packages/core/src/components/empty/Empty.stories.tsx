import React from "react";

import { Empty } from "./Empty";

export default {
  title: "Example/Empty",
  component: Empty,
  argTypes: {},
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = () => <Empty />;

export const Default = Template.bind({});

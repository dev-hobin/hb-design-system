import React from "react";
import { RadioGroup } from "./RadioGroup";

export default { title: "Component/RadioGroup" };

export const Default = () => {
  return (
    <>
      <button type="button">버튼</button>
      <RadioGroup>
        <RadioGroup.Item value={"radio-1"}>라디오 - 1</RadioGroup.Item>
        <RadioGroup.Item value={"radio-2"}>라디오 - 2</RadioGroup.Item>
        <RadioGroup.Item value={"radio-3"}>라디오 - 3</RadioGroup.Item>
      </RadioGroup>
    </>
  );
};

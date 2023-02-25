import React from "react";
import { RadioGroup } from "./RadioGroup";

export default { title: "Component/RadioGroup" };

export const Default = () => {
  return (
    <>
      <button type="button">버튼</button>
      <form
        onChange={(e) => {
          e.preventDefault();
          console.log(e);
        }}
      >
        <RadioGroup required name="required">
          <RadioGroup.Item value={"radio-1"}>라디오 - 1</RadioGroup.Item>
          <RadioGroup.Item value={"radio-2"}>라디오 - 2</RadioGroup.Item>
          <RadioGroup.Item value={"radio-3"}>라디오 - 3</RadioGroup.Item>
        </RadioGroup>
        <button type="submit">서브밋</button>
      </form>
    </>
  );
};

import React from "react";
import { Checkbox } from "./Checkbox";

export default { title: "Component/Checkbox" };

export const Default = () => {
  return (
    <>
      <button type="button">버튼</button>
      <form
        onChange={(e) => {
          console.log(e);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          console.log(e);
        }}
      >
        <Checkbox name="hi">
          <Checkbox.Indicator
            style={{ display: "block", width: 50, height: 50, backgroundColor: "red" }}
          />
        </Checkbox>
      </form>
    </>
  );
};

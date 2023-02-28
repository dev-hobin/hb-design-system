import React from "react";
import { Listbox } from "./Listbox";

export default { title: "Component/Listbox2" };

export const Default = () => {
  return (
    <Listbox>
      <Listbox.Trigger>
        <Listbox.Value />
      </Listbox.Trigger>
      <Listbox.Portal>
        <Listbox.Panel placement="bottom" offsetOptions={12}>
          <Listbox.Item value="1" textValue="첫번째">
            첫번째
          </Listbox.Item>
          <Listbox.Item value="2" textValue="두번쨰">
            두번째
          </Listbox.Item>
          <Listbox.Item value="3" textValue="세번쨰">
            세번째
          </Listbox.Item>
        </Listbox.Panel>
      </Listbox.Portal>
    </Listbox>
  );
};

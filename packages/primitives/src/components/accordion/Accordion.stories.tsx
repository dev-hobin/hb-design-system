import React from "react";
import { Accordion } from "./Accordion";

export default { title: "Component/Accordion" };

export const Default = () => {
  return (
    <Accordion type="multiple" defaultValue={["accordion-1", "accordion-2"]}>
      <Accordion.Item value="accordion-1">
        <Accordion.Header>
          <Accordion.Trigger>FAQ 1</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>FAQ 1 내용</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="accordion-2">
        <Accordion.Header>
          <Accordion.Trigger>FAQ 2</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>FAQ 2 내용</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="accordion-3">
        <Accordion.Header>
          <Accordion.Trigger>FAQ 3</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>FAQ 3 내용</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

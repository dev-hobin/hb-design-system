import { css } from "@stitches/react";
import React, { useState } from "react";
import { Accordion } from "./Accordion";

export default { title: "Component/Accordion" };

const rootCss = css({
  boxSizing: "border-box",
  borderRadius: 12,
  overflow: "hidden",
  maxWidth: 500,
  padding: 8,
});
const itemCss = css({
  paddingBottom: 12,
  "&[data-state=open]": {
    paddingBottom: 0,
  },
  "&[data-disabled=true]": {
    paddingBottom: 12,
  },
  "&:last-child": {
    paddingBottom: 0,
  },
});
const headerCss = css({
  margin: 0,
});
const triggerCss = css({
  border: "none",
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  textAlign: "left",
  backgroundColor: "#9747FF",
  color: "#ffffff",
  fontSize: 14,
  cursor: "pointer",

  "&[data-disabled=true]": {
    cursor: "not-allowed",
    backgroundColor: "#F1F3F6",
    color: "#282A2E",
  },
});

const panelCss = css({
  padding: "12px 16px",
  borderRadius: 12,
  color: "#282A2E",
  fontSize: 14,
});

export const Single = () => {
  const [value, setValue] = useState<string>();
  return (
    <>
      <h1>Uncontrolled</h1>
      <Accordion type="single" defaultValue={"accordion-2"} className={rootCss()}>
        <Accordion.Item value="accordion-1" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-2" className={itemCss()} disabled>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi! Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Iste voluptate porro tenetur, suscipit fuga totam alias qui reiciendis
            ad. Libero pariatur consectetur tempore possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-3" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <h1>Controlled</h1>
      <Accordion type="single" value={value} onValueChange={setValue} className={rootCss()}>
        <Accordion.Item value="accordion-1" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-2" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi! Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Iste voluptate porro tenetur, suscipit fuga totam alias qui reiciendis
            ad. Libero pariatur consectetur tempore possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-3" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export const Multiple = () => {
  const [value, setValue] = useState<string[]>();

  return (
    <>
      <h1>Uncontrolled</h1>
      <Accordion
        type="multiple"
        defaultValue={["accordion-1", "accordion-2"]}
        className={rootCss()}
      >
        <Accordion.Item value="accordion-1" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-2" className={itemCss()} disabled>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi! Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Iste voluptate porro tenetur, suscipit fuga totam alias qui reiciendis
            ad. Libero pariatur consectetur tempore possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-3" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <h1>Controlled</h1>
      <Accordion type="multiple" value={value} onValueChange={setValue} className={rootCss()}>
        <Accordion.Item value="accordion-1" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 1</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-2" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 2</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi! Lorem ipsum dolor sit, amet consectetur
            adipisicing elit. Iste voluptate porro tenetur, suscipit fuga totam alias qui reiciendis
            ad. Libero pariatur consectetur tempore possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="accordion-3" className={itemCss()}>
          <Accordion.Header className={headerCss()}>
            <Accordion.Trigger className={triggerCss()}>FAQ 3</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panelCss()}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iste voluptate porro tenetur,
            suscipit fuga totam alias qui reiciendis ad. Libero pariatur consectetur tempore
            possimus et voluptate non nam odio commodi!
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

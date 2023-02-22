import React, { useState } from "react";
import { Tabs } from "./Tabs";
import { css } from "@stitches/react";

export default { title: "Component/Tabs" };

export const Default = () => {
  return (
    <Tabs defaultValue="tab-1" className={rootCss()}>
      <Tabs.List className={listCss()}>
        <Tabs.Tab value="tab-1" className={tabCss()}>
          <div>탭 1</div>
        </Tabs.Tab>
        <Tabs.Tab value="tab-2" className={tabCss()}>
          탭 2
        </Tabs.Tab>
        <Tabs.Tab value="tab-3" className={tabCss()}>
          탭 3
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab-1" className={panelCss()}>
        컨텐츠 1
      </Tabs.Panel>
      <Tabs.Panel value="tab-2" className={panelCss()}>
        컨텐츠 2
      </Tabs.Panel>
      <Tabs.Panel value="tab-3" className={panelCss()}>
        컨텐츠 3
      </Tabs.Panel>
    </Tabs>
  );
};

export const Controlled = () => {
  const [tab, setTab] = useState<string>("tab-1");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <Tabs.List>
        <Tabs.Tab value="tab-1">탭 1</Tabs.Tab>
        <Tabs.Tab value="tab-2">탭 2</Tabs.Tab>
        <Tabs.Tab value="tab-3">탭 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab-1">컨텐츠 1</Tabs.Panel>
      <Tabs.Panel value="tab-2">컨텐츠 2</Tabs.Panel>
      <Tabs.Panel value="tab-3">컨텐츠 3</Tabs.Panel>
    </Tabs>
  );
};

export const ForceMounted = () => {
  return (
    <Tabs defaultValue="tab-1">
      <Tabs.List>
        <Tabs.Tab value="tab-1">탭 1</Tabs.Tab>
        <Tabs.Tab value="tab-2">탭 2</Tabs.Tab>
        <Tabs.Tab value="tab-3">탭 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab-1" forceMount>
        컨텐츠 1
      </Tabs.Panel>
      <Tabs.Panel value="tab-2">컨텐츠 2</Tabs.Panel>
      <Tabs.Panel value="tab-3">컨텐츠 3</Tabs.Panel>
    </Tabs>
  );
};

const rootCss = css({
  border: "1px solid #eee",
  maxWidth: "500px",
});
const listCss = css({
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  backgroundColor: "#eee",
  '&[data-orientation="vertical"]': {
    flexDirection: "column",
  },
});
const tabCss = css({
  border: 0,
  backgroundColor: "transparent",
  flex: 1,
  textAlign: "center",
  padding: "4px 6px",
});
const panelCss = css({
  padding: 10,
});

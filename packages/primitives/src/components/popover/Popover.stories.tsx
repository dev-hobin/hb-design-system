import React from "react";
import { Popover } from "./Popover";

export default { title: "Component/Popover" };

export const Default = () => {
  return (
    <div style={{ minHeight: 1000 }}>
      <Popover>
        <Popover.Anchor asChild>
          <Popover.Trigger>팝오버 열기</Popover.Trigger>
        </Popover.Anchor>
        <Popover.Panel placement="bottom">
          <p>다른 컨텐츠 내용들</p>
          {/* <Popover.Close>닫기</Popover.Close> */}
          <Popover>
            <Popover.Anchor />
            <Popover.Trigger>팝오버 열기</Popover.Trigger>
            <Popover.Panel placement="right">
              <p>다른 컨텐츠 내용들</p>
              <Popover.Close>닫기</Popover.Close>
            </Popover.Panel>
          </Popover>
        </Popover.Panel>
      </Popover>
      <button type="button" onClick={() => console.log("clicked")}>
        바깥 버튼
      </button>
    </div>
  );
};

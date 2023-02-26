import React, { useState } from "react";
import { Dialog } from "./Dialog";

export default { title: "Component/Dialog" };

export const Default = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>모달 열기</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, backgroundColor: "#00000030" }} />
          <Dialog.Content
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              width: 500,
              height: 700,
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: 16,
            }}
          >
            <Dialog.Title>모달 타이틀</Dialog.Title>
            <Dialog.Description>모달 설명</Dialog.Description>
            <p>다른 컨텐츠 내용들</p>
            <Dialog.Close>닫기</Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
      <h1>TESTTESTTESTTESTTESTTESTTESTTESTTEST</h1>
    </>
  );
};

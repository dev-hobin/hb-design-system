import React from "react";

import { Slot } from "./Slot";

export default { title: "Component/Slot" };

export const Default = () => {
  return (
    <Slot data-slot-element>
      <p>Slot Child</p>
    </Slot>
  );
};

export const WithStyle = () => {
  return (
    <>
      <h2>Slot에게만 style이 주어졌을 경우</h2>
      <p>child 컴포넌트의 color : red</p>
      <Slot style={{ color: "red" }}>
        <p>Slot Child</p>
      </Slot>

      <h2>Child에게만 style이 주어졌을 경우</h2>
      <p>child 컴포넌트의 color : blue</p>
      <Slot>
        <p style={{ color: "blue" }}>Slot Child</p>
      </Slot>

      <h2>Slot, Child 둘 다 style이 주어졌을 경우</h2>
      <p>child 컴포넌트의 color : blue</p>
      <Slot style={{ color: "red" }}>
        <p style={{ color: "blue" }}>Slot Child</p>
      </Slot>
    </>
  );
};

export const WithComposedEventHandler = () => {
  return (
    <>
      <h2>Slot에게만 onClick이 주어졌을 경우</h2>
      <p>slot click event 발생</p>
      <Slot
        onClick={() => {
          console.log("slot click event");
        }}
      >
        <button type="button">Slot Child</button>
      </Slot>

      <h2>Child에게만 onClick이 주어졌을 경우</h2>
      <p>slot child click event 발생</p>
      <Slot>
        <button type="button" onClick={() => console.log("slot child click event")}>
          Slot Child
        </button>
      </Slot>

      <h2>Slot, Child 둘 다 onClick이 주어졌을 경우</h2>
      <p>child event, slot event 순으로 이벤트 발생</p>
      <Slot
        onClick={() => {
          console.log("slot event");
        }}
      >
        <button type="button" onClick={() => console.log("child event")}>
          Slot Child
        </button>
      </Slot>
    </>
  );
};

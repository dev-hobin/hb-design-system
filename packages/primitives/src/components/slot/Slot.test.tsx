import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { Slot } from "./Slot";

/**
 * 0. Slot은 asChild prop이 true일 경우 children 컴포넌트로 렌더링시키며 ref와 Slot에 넘겨진 props를 children에 오버라이딩한다.
 * 1. Slot의 children으로는 하나의 children만 가질 수 있다.
 * 2. Slot의 props 중 이벤트 핸들러는 children의 이벤트 핸들러와 병합된다.
 * 3. Slot의 props 중 style 은 children의 style과 병합된다.
 */

describe("Slot 이벤트 핸들러 병합", () => {
  describe("이벤트 핸들러가 parent에게만 주어졌을 때", () => {
    const handleClick = jest.fn();

    beforeEach(() => {
      handleClick.mockReset();
      render(
        <Slot onClick={handleClick}>
          <button type="button">버튼</button>
        </Slot>
      );
      fireEvent.click(screen.getByRole("button"));
    });

    it("parent에 전달된 핸들러가 작동해야한다.", async () => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("이벤트 핸들러가 children에게만 주어졌을 때", () => {
    const handleClick = jest.fn();

    beforeEach(() => {
      handleClick.mockReset();
      render(
        <Slot>
          <button type="button" onClick={handleClick}>
            버튼
          </button>
        </Slot>
      );
      fireEvent.click(screen.getByRole("button"));
    });

    it("children에 전달된 핸들러가 작동해야한다.", async () => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("이벤트 핸들러가 parent, child 둘 다에게 주어졌을 때", () => {
    const handleParentClick = jest.fn();
    const handleChildClick = jest.fn();

    beforeEach(() => {
      handleParentClick.mockReset();
      handleChildClick.mockReset();
      render(
        <Slot onClick={handleParentClick}>
          <button role="button" type="button" onClick={handleChildClick}>
            버튼
          </button>
        </Slot>
      );
      fireEvent.click(screen.getByRole("button"));
    });

    it("parent에 전달된 핸들러가 작동해야한다.", async () => {
      expect(handleParentClick).toHaveBeenCalledTimes(1);
    });
    it("children에 전달된 핸들러가 작동해야한다.", async () => {
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Slot className 병합", () => {
  describe("className이 parent에게만 주어졌을 때", () => {
    beforeEach(() => {
      render(
        <Slot className="slot-class">
          <button type="button">버튼</button>
        </Slot>
      );
    });

    it("child는 parent의 classname을 갖는다", () => {
      expect(screen.getByRole("button").className).toBe("slot-class");
    });
  });

  describe("className이 children에게만 주어졌을 때", () => {
    beforeEach(() => {
      render(
        <Slot>
          <button type="button" className="child-class">
            버튼
          </button>
        </Slot>
      );
    });

    it("child는 child의 classname을 갖는다", () => {
      expect(screen.getByRole("button").className).toBe("child-class");
    });
  });

  describe("className이 parent, child 둘 다에게 주어졌을 때", () => {
    beforeEach(() => {
      render(
        <Slot className="slot-class">
          <button type="button" className="child-class">
            버튼
          </button>
        </Slot>
      );
    });

    it("child는 parent와 child의 classname을 갖는다", () => {
      expect(screen.getByRole("button").className).toBe("slot-class child-class");
    });
  });
});

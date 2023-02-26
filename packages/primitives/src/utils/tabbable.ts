import { sortByDomNode } from "./sortByDomNode";

const candidateSelectors = [
  "input",
  "select",
  "textarea",
  "a[href]",
  "button",
  "[tabindex]:not(slot)",
  "audio[controls]",
  "video[controls]",
  '[contenteditable]:not([contenteditable="false"])',
  "details>summary:first-of-type",
  "details",
];
const candidateSelector = candidateSelectors.join(",");

const getCandidates = (
  el: HTMLElement,
  includeContainer: boolean,
  filter: (el: HTMLElement) => boolean
) => {
  let candidates = Array.from(el.querySelectorAll<HTMLElement>(candidateSelector));
  if (includeContainer && el.matches(candidateSelector)) candidates.unshift(el);
  candidates = candidates.filter((el) => filter(el));
  return candidates;
};

const isInput = (el: Element): el is HTMLInputElement => el.tagName === "INPUT";
const isHiddenInput = (el: Element): el is HTMLInputElement => isInput(el) && el.type === "hidden";
const isHidden = (el: Element) => {
  if (getComputedStyle(el).visibility === "hidden") return true;
  return false;
};

const getTabIndex = (el: HTMLElement) => el.tabIndex;

const isNodeMatchingSelectorFocusable = (el: Element) => {
  if (("disabled" in el && el.disabled) || isHiddenInput(el) || isHidden(el)) {
    return false;
  }
  return true;
};
const isNodeMatchingSelectorTabbable = (el: HTMLElement) => {
  if (getTabIndex(el) < 0 || !isNodeMatchingSelectorFocusable(el)) {
    return false;
  }
  return true;
};

const tabbable = (el: HTMLElement, includeContainer: boolean) => {
  const candidates = getCandidates(el, includeContainer, isNodeMatchingSelectorTabbable);
  return sortByDomNode(candidates);
};
const isTabbable = (el: HTMLElement) => {
  if (!el.matches(candidateSelector)) return false;
  return isNodeMatchingSelectorTabbable(el);
};
const focusable = (el: HTMLElement, includeContainer: boolean) => {
  const candidates = getCandidates(el, includeContainer, isNodeMatchingSelectorFocusable);
  return sortByDomNode(candidates);
};
const focusableCandidateSelector = candidateSelectors.concat("iframe").join(",");
const isFocusable = (el: HTMLElement) => {
  if (!el.matches(focusableCandidateSelector)) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(el);
};

export { tabbable, isTabbable, focusable, isFocusable };

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
const isDetailsWithSummary = (el: Element) => {
  return !!(
    el.tagName === "DETAILS" && Array.from(el.children).some((child) => child.tagName === "SUMMARY")
  );
};
const isHidden = (el: Element) => {
  if (getComputedStyle(el).visibility === "hidden") return true;
  const isDirectSummary = el.matches("details>summary:first-of-type");
  const nodeUnderDetails = isDirectSummary ? el.parentElement : el;
  if (nodeUnderDetails?.matches("details:not([open]) *")) {
    return true;
  }
  return false;
};
const isDisabledFromFieldset = (el: Element) => {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(el.tagName)) {
    let parentElement = el.parentElement;
    while (parentElement) {
      if (parentElement.tagName === "FIELDSET" && (parentElement as HTMLFieldSetElement).disabled) {
        for (let i = 0; i < parentElement.children.length; i++) {
          const child = parentElement.children.item(i);
          if (child && child.tagName === "LEGEND") {
            return parentElement.matches("fieldset[disabled] *") ? true : !child.contains(el);
          }
        }
        return true;
      }
      parentElement = parentElement.parentElement;
    }
  }

  return false;
};
const isNodeMatchingSelectorFocusable = (el: Element) => {
  if (
    ("disabled" in el && el.disabled) ||
    isHiddenInput(el) ||
    isHidden(el) ||
    isDetailsWithSummary(el) ||
    isDisabledFromFieldset(el)
  ) {
    return false;
  }
  return true;
};
const focusable = (el: HTMLElement, includeContainer: boolean) => {
  return getCandidates(el, includeContainer, isNodeMatchingSelectorFocusable);
};

const focusableCandidateSelector = candidateSelectors.concat("iframe").join(",");
const isFocusable = (el: HTMLElement) => {
  if (!el.matches(focusableCandidateSelector)) {
    return false;
  }
  return isNodeMatchingSelectorFocusable(el);
};

export { focusable, isFocusable };

export const sortByDomNode = <T>(
  nodes: T[],
  resolveKey: (item: T) => HTMLElement | null = (i) => i as HTMLElement | null
): T[] => {
  return nodes.slice().sort((aItem, bItem) => {
    const a = resolveKey(aItem);
    const b = resolveKey(bItem);

    if (a === null || b === null) return 0;

    const position = a.compareDocumentPosition(b);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;

    return 0;
  });
};

import { useCallback, useRef, useState } from "react";

/** Tooltip that follows the pointer. Only the text lives in React state: the position is written straight to the
 * element, so pointer moves within one target don't re-render the (possibly heavy) owner. */
export function useHoverTooltip() {
  const [text, setText] = useState<string | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const element = useRef<HTMLDivElement | null>(null);

  const place = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.style.left = `${position.current.x}px`;
    node.style.top = `${position.current.y}px`;
  }, []);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node;
      place(node);
    },
    [place],
  );

  const show = useCallback(
    (x: number, y: number, nextText: string) => {
      position.current = { x, y };
      place(element.current);
      setText(nextText);
    },
    [place],
  );

  const hide = useCallback(() => setText(null), []);

  return { text, ref, show, hide };
}

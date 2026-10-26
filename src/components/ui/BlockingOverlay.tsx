"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsFetching, useMutationState } from "@tanstack/react-query";
import { RingLoader } from "@behindthemusictree/ui";

const DEFAULT_LABEL = "Saving changes…";
const REFRESH_LABEL = "Refreshing tree…";
const ELAPSED_THRESHOLD_SECONDS = 3;

export default function BlockingOverlay() {
  const labels = useMutationState({
    filters: { status: "pending", predicate: (mutation) => mutation.meta?.blocking !== false },
    select: (mutation) => mutation.meta?.pendingLabel?.(mutation.state.variables) ?? DEFAULT_LABEL,
  });
  const isFetching = useIsFetching() > 0;
  const isBlocking = labels.length > 0;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isBlocking) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => {
      clearInterval(timer);
      setElapsed(0);
    };
  }, [isBlocking]);

  useEffect(() => {
    if (!isBlocking) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const inerted = Array.from(document.body.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child !== overlayRef.current && !child.inert,
    );
    inerted.forEach((child) => {
      child.inert = true;
    });
    const swallowKey = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", swallowKey, true);
    return () => {
      window.removeEventListener("keydown", swallowKey, true);
      inerted.forEach((child) => {
        child.inert = false;
      });
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isBlocking]);

  if (!isBlocking) return null;

  const label = isFetching ? REFRESH_LABEL : labels[0];
  return createPortal(
    <div
      ref={overlayRef}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[2147483647] flex flex-col items-center justify-center gap-4 text-white bg-black bg-opacity-50 cursor-wait"
    >
      <RingLoader />
      <p className="text-lg font-medium">
        {label}
        {elapsed >= ELAPSED_THRESHOLD_SECONDS && ` · ${elapsed} s`}
      </p>
    </div>,
    document.body,
  );
}

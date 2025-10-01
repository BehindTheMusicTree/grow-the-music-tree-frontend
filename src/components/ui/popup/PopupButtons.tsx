"use client";

import { ReactNode } from "react";

interface PopupButtonsProps {
  children: ReactNode;
  alignment?: "left" | "center" | "right";
  className?: string;
}

export function PopupButtons({ children, alignment = "center", className = "" }: PopupButtonsProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return <div className={`flex gap-3 ${alignmentClasses[alignment]} ${className}`}>{children}</div>;
}

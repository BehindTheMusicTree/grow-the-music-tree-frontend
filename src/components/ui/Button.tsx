"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export default function Button({ children, className, ...otherProps }: ButtonProps) {
  return (
    <button className={classnames("button", className)} {...otherProps}>
      {children}
    </button>
  );
}

"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import classnames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "danger" | "secondary";
}

export function Button({ children, className, variant = "default", ...otherProps }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-medium transition-colors duration-200";

  const variantStyles = {
    default: "bg-black text-white hover:bg-black/80",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  };

  return (
    <button className={classnames(baseStyles, variantStyles[variant], className)} {...otherProps}>
      {children}
    </button>
  );
}

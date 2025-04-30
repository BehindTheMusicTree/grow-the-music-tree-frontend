"use client";

import { LucideIcon } from "lucide-react";
import { Button, ButtonProps } from "./Button";

interface IconTextButtonProps extends Omit<ButtonProps, "children"> {
  icon: LucideIcon;
  text: string;
  iconPosition?: "left" | "right";
}

export function IconTextButton({ icon: Icon, text, iconPosition = "left", ...props }: IconTextButtonProps) {
  return (
    <Button {...props}>
      <div className="flex items-center gap-2">
        {iconPosition === "left" && <Icon className="h-4 w-4" />}
        <span>{text}</span>
        {iconPosition === "right" && <Icon className="h-4 w-4" />}
      </div>
    </Button>
  );
}

"use client";

import { ComponentProps } from "react";
import { AuthErrorPopup as AppKitAuthErrorPopup } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type AuthErrorPopupProps = Omit<ComponentProps<typeof AppKitAuthErrorPopup>, "topOffset">;

export default function AuthErrorPopup(props: AuthErrorPopupProps) {
  return <AppKitAuthErrorPopup {...props} topOffset={BANNER_HEIGHT} />;
}

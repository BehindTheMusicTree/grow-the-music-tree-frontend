"use client";

import { ComponentProps } from "react";
import { InternalErrorPopup as AppKitInternalErrorPopup } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type InternalErrorPopupProps = Omit<ComponentProps<typeof AppKitInternalErrorPopup>, "topOffset" | "contactEmail">;

export default function InternalErrorPopup(props: InternalErrorPopupProps) {
  return (
    <AppKitInternalErrorPopup
      {...props}
      topOffset={BANNER_HEIGHT}
      contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null}
    />
  );
}

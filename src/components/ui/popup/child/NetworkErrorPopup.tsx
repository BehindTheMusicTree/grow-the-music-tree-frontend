"use client";

import { ComponentProps } from "react";
import { NetworkErrorPopup as AppKitNetworkErrorPopup } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type NetworkErrorPopupProps = Omit<ComponentProps<typeof AppKitNetworkErrorPopup>, "topOffset">;

export default function NetworkErrorPopup(props: NetworkErrorPopupProps) {
  return <AppKitNetworkErrorPopup {...props} topOffset={BANNER_HEIGHT} />;
}

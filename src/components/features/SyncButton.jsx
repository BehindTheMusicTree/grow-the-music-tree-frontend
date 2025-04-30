"use client";

import { RefreshCw } from "lucide-react";
import { IconTextButton } from "@components/ui/IconTextButton";

export default function SyncButton({ onSync, isPending }) {
  return (
    <div className="flex my-4">
      <IconTextButton
        icon={RefreshCw}
        text="Sync"
        onClick={onSync}
        disabled={isPending}
        className={isPending ? "animate-spin" : ""}
      />
    </div>
  );
}

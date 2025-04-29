"use client";

import { FaSync } from "react-icons/fa";

export default function SyncButton({ onSync, isPending }) {
  return (
    <div className="flex my-4">
      <button className="action-round-button" onClick={onSync} disabled={isPending}>
        <FaSync size={32} className={isPending ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

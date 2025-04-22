"use client";

import { FaSync } from "react-icons/fa";

export default function SyncButton({ onSync, isLoading }) {
  return (
    <div className="flex my-4">
      <button className="action-round-button" onClick={onSync} disabled={isLoading}>
        <FaSync size={32} className={isLoading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}

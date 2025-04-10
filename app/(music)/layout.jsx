"use client";

import { MusicProvider } from "@/contexts/MusicContext";

export default function MusicLayout({ children }) {
  return (
    <MusicProvider>
      <div className="flex flex-col h-full">{children}</div>
    </MusicProvider>
  );
}

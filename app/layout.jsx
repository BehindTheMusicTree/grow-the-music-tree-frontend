import { initSentry } from "@/lib/sentry";
import { checkRequiredConfigVars } from "@/lib/config";
import Menu from "@/components/layout/Menu";
import Player from "@/app/components/client/player/Player";
import TrackListSidebar from "@/components/track-list/TrackListSidebar";
import { TrackListSidebarProvider } from "@/contexts/TrackListSidebarContext";

// Initialize Sentry and check config
initSentry();
checkRequiredConfigVars();

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TrackListSidebarProvider>
          <Menu />
          <main className="flex-grow p-5 overflow-auto bg-gray-200">{children}</main>
          <TrackListSidebar />
          <Player />
        </TrackListSidebarProvider>
      </body>
    </html>
  );
}

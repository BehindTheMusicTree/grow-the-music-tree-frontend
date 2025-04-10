import Menu from "@/components/layout/Menu";
import Player from "@/components/player/Player";
import TrackListSidebar from "@/components/track-list/TrackListSidebar";
import { TrackListSidebarProvider } from "@/contexts/TrackListSidebarContext";

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

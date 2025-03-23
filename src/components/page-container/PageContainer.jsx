import { PAGE_TYPES } from "../../utils/constants";
import { useTrackListSidebarVisibility } from "../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";
import { usePage } from "../../contexts/page/usePage";
import TrackListSidebar from "./track-list-sidebar/TrackListSidebar";
import GenresPlaylists from "./pages/genre-playlists/GenrePlaylists";
import Library from "./pages/library/Library";
import ErrorBoundary from "../utils/ErrorBoundary";

export default function PageContainer() {
  const { page } = usePage();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();

  return (
    /* 180px being the sum of the banner and player heights, 100px being the height of the banner alone */
    <div className={"page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0"}>
      <ErrorBoundary>
        {(() => {
          switch (page.type) {
            case PAGE_TYPES.GENRE_PLAYLISTS:
              return <GenresPlaylists />;
            case PAGE_TYPES.LIBRARY:
              return <Library />;
            default:
              return <div>Unknown page type</div>;
          }
        })()}
      </ErrorBoundary>
      {/* { isPlayingTrack
      ? <IconPlay dataTestId="play"/>
      : <IconPause dataTestId="pause"/>
        } */}

      {/* bottom-20 corresponding to 80px which is the player's height */}
      {isTrackListSidebarVisible ? <TrackListSidebar /> : null}
    </div>
  );
}

PageContainer.propTypes = {};

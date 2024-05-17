import PropTypes from "prop-types";

import TrackListSidebar from "./track-list-sidebar/TrackListSidebar";
import { CONTENT_AREA_TYPES } from "../../constants";
import GenresPage from "./genre-playlists-page/GenrePlaylistsPage";
import { useTrackListSidebarVisibility } from "../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";
import { usePlayerTrackObject } from "../../contexts/player-lib-track-object/usePlayerLibTrackObject";

export default function PageContainer({ pageTypeWithObject }) {
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { playerLibTrackObject } = usePlayerTrackObject();

  return (
    /* 180px being the sum of the banner and player heights, 100px being the height of the banner alone */
    <div
      className={
        "page-container flex-grow overflow-auto max-h-[calc(100%-" +
        (playerLibTrackObject ? "180px" : "100px") +
        ")] flex flex-col bg-gray-200 m-0 px-8 pb-5"
      }
    >
      {pageTypeWithObject.current.type === CONTENT_AREA_TYPES.GENRES ? (
        <GenresPage />
      ) : (
        <div>Unknown content area type</div>
      )}
      {/* { isPlayingTrack
      ? <IconPlay dataTestId="play"/>
      : <IconPause dataTestId="pause"/>
        } */}

      {/* bottom-20 corresponding to 80px which is the player's height */}
      {isTrackListSidebarVisible ? (
        <div className="track-list-sidebar-container absolute bottom-20 right-0 w-144 overflow-auto max-h-[calc(100%-180px)] min-h-[calc((100%-180px)/3)] rounded-2xl bg-gray-950">
          <TrackListSidebar />
        </div>
      ) : null}
    </div>
  );
}

PageContainer.propTypes = {
  pageTypeWithObject: PropTypes.object.isRequired,
};

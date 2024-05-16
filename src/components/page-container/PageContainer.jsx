import PropTypes from "prop-types";

import TrackListSidebar from "./track-list-sidebar/TrackListSidebar";
import { CONTENT_AREA_TYPES } from "../../constants";
import GenresPage from "./genres-page/GenresPage";
import { useTrackListSidebarVisibility } from "../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";
import { usePlayerTrackObject } from "../../contexts/player-track-object/usePlayerTrackObject";

export default function PageContainer({ pageTypeWithObject }) {
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { playerTrackObject } = usePlayerTrackObject();

  return (
    /* 180px being the sum of the banner and player heights, 100px being the height of the banner alone */
    <div
      className={
        "page-container flex-grow overflow-auto max-h-[calc(100%-" +
        (playerTrackObject ? "180px" : "100px") +
        ")] flex flex-col bg-gray-200 m-0 px-8 pb-5"
      }
    >
      {/* <div className="page-container flex-grow overflow-auto max-h-[calc(100%-180px)] flex flex-col bg-gray-200 m-0 px-8 pb-5"> */}

      {pageTypeWithObject.current.type === CONTENT_AREA_TYPES.GENRES ? (
        <GenresPage />
      ) : (
        <div>Unknown content area type</div>
      )}
      {/* { isPlayingTrack
      ? <IconPlay dataTestId="play"/>
      : <IconPause dataTestId="pause"/>
        } */}
      {isTrackListSidebarVisible ? (
        <div className="track-list-sidebar-container absolute right-0 w-144 overflow-auto max-h-[calc(100%-180px)] rounded-2xl bg-gray-950">
          <TrackListSidebar />
        </div>
      ) : null}
    </div>
  );
}

PageContainer.propTypes = {
  pageTypeWithObject: PropTypes.object.isRequired,
};

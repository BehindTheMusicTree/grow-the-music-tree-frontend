import PropTypes from "prop-types";
import TrackListSidebar from "./track-list-sidebar/TrackListSidebar";
import { CONTENT_AREA_TYPES } from "../../constants";
import GenresPage from "./genres-page/GenresPage";

export default function PageContainer({
  pageTypeWithObject,
  isTrackListSidebarVisible,
  playingPlaylistUuidWithLoadingState,
  refreshGenresSignal,
  handleUpdatedLibTrack,
}) {
  return (
    <div className="relative w-full h-full flex bg-gray-200 font-sans m-0 pl-8">
      {pageTypeWithObject.current.type === CONTENT_AREA_TYPES.GENRES ? (
        <GenresPage
          playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}
          refreshGenresSignal={refreshGenresSignal}
        />
      ) : (
        <div>Unknown content area type</div>
      )}
      {/* { isPlayingTrack
      ? <IconPlay dataTestId="play"/>
      : <IconPause dataTestId="pause"/>
        } */}
      {isTrackListSidebarVisible ? (
        <div className="TrackListSidebarContainer absolute right-0 w-144 h-full bg-black bg-opacity-95">
          <TrackListSidebar handleUpdatedLibTrack={handleUpdatedLibTrack} />
        </div>
      ) : null}
    </div>
  );
}

PageContainer.propTypes = {
  pageTypeWithObject: PropTypes.object.isRequired,
  isTrackListSidebarVisible: PropTypes.bool.isRequired,
  playingPlaylistUuidWithLoadingState: PropTypes.object,
  refreshGenresSignal: PropTypes.number.isRequired,
  handleUpdatedLibTrack: PropTypes.func.isRequired,
};

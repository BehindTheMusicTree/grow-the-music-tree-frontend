import PropTypes from "prop-types";
import TrackListSidebar from "./track-list-sidebar/TrackListSidebar";
import { CONTENT_AREA_TYPES } from "../../constants";
import GenresPage from "./genres-page/GenresPage";

export default function PageContainer({ pageTypeWithObject, isTrackListSidebarVisible }) {
  return (
    /* 180px being the sum of the banner and player heights */
    <div className="page-container flex-grow overflow-auto max-h-[calc(100%-180px)] flex flex-col bg-gray-200 m-0 px-8 pb-5">
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
        <div className="track-list-sidebar-container absolute right-0 w-144 h-full bg-black bg-opacity-95">
          <TrackListSidebar />
        </div>
      ) : null}
    </div>
  );
}

PageContainer.propTypes = {
  pageTypeWithObject: PropTypes.object.isRequired,
  isTrackListSidebarVisible: PropTypes.bool.isRequired,
};

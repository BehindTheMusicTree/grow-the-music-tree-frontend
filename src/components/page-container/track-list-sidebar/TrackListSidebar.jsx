import TrackItem from "./track-item/TrackItem";
import { capitalizeFirstLetter } from "../../../utils";
import { usePlaylistPlayObject } from "../../../contexts/playlist-play-object/usePlaylistPlayObject";
import { useTrackListSidebarVisibility } from "../../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";

export default function TrackListSidebar() {
  const { playlistPlayObject } = usePlaylistPlayObject();
  const { setIsTrackListSidebarVisible } = useTrackListSidebarVisibility();

  return (
    <div className="track-list-sidebar">
      <div className="header flex px-4 py-2">
        <div className="name flex flex-col justify-center items-center text-gray-300 text-xl font-bold pr-2">
          {playlistPlayObject.contentObject.name}
        </div>
        <div className="info flex flex-col justify-center items-center text-gray-400 text-m pt-1">
          {"• " + capitalizeFirstLetter(playlistPlayObject.contentObject.type) + " playlist • "}
          {playlistPlayObject.contentObject.libraryTracksCount +
            " track" +
            (playlistPlayObject.contentObject.libraryTracksCount > 1 ? "s •" : " •")}
        </div>
        <div
          className="flex-grow flex flex-col items-end justify-center h-full cursor-pointer"
          onClick={() => setIsTrackListSidebarVisible(false)}
        >
          &#10005;
        </div>
      </div>
      <div>
        <ul className="track-list list-none p-0 m-0">
          {playlistPlayObject.contentObject.libraryTracks.map((playlistTrackRelation) => (
            <li key={playlistTrackRelation.libraryTrack.uuid}>
              <TrackItem playlistTrackRelationObject={playlistTrackRelation} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

TrackListSidebar.propTypes = {};

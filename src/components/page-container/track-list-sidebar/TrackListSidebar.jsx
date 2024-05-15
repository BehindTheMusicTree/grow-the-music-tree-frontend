import TrackItem from "./track-item/TrackItem";
import { capitalizeFirstLetter } from "../../../utils";
import { usePlaylistPlayObject } from "../../../contexts/playlist-play-object/usePlaylistPlayObject.jsx";

export default function TrackListSidebar() {
  const { playlistPlayObject } = usePlaylistPlayObject();
  return (
    <div className="TrackListSideBar">
      <div className="Header flex flex-row px-4 py-2">
        <div className="Name flex flex-col justify-center items-center text-gray-300 text-xl font-bold pr-2">
          {playlistPlayObject.contentObject.name}
        </div>
        <div className="Info flex flex-col justify-center items-center text-gray-400 text-m pt-1">
          {"• " + capitalizeFirstLetter(playlistPlayObject.contentObject.type) + " playlist • "}
          {playlistPlayObject.contentObject.libraryTracksCount +
            " track" +
            (playlistPlayObject.contentObject.libraryTracksCount > 1 ? "s •" : " •")}
        </div>
      </div>
      <div>
        <ul className="TrackList list-none p-0 m-0">
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

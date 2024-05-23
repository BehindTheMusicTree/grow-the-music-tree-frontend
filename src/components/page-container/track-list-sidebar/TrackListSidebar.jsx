import TrackItem from "./track-item/TrackItem";
import { capitalizeFirstLetter } from "../../../utils";
import { useTrackList } from "../../../contexts/track-list/useTrackList";
import { useTrackListSidebarVisibility } from "../../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";
import { TRACK_LIST_ORIGIN_TYPE } from "../../../constants";

export default function TrackListSidebar() {
  const { trackList, origin } = useTrackList();
  const { setIsTrackListSidebarVisible } = useTrackListSidebarVisibility();

  return (
    <div className="track-list-sidebar">
      <div className="header px-4 py-2 text-gray-400">
        {origin ? (
          <div className="flex">
            <div className="origin flex text-xl ">
              <div className="from h-auto flex flex-col justify-center items-center mr-2">From</div>
              <div className="name flex flex-col justify-center items-center text-gray-300 font-bold pr-2">
                {origin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST
                  ? origin.object.name
                  : `${origin.object.title} ` + (origin.object.artist ? `by ${origin.object.artist.name}` : "")}
              </div>
            </div>
            <div className="info flex flex-col justify-center items-center text-m pt-1">
              {origin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST
                ? "• " + capitalizeFirstLetter(origin.object.type) + " playlist • "
                : "• track playlist • "}
              {trackList.length + " track" + (trackList.length > 1 ? "s •" : " •")}
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}

        <div
          className="flex-grow flex flex-col items-end justify-center h-full cursor-pointer"
          onClick={() => setIsTrackListSidebarVisible(false)}
        >
          &#10005;
        </div>
      </div>
      <div>
        <ul className="track-list list-none p-0 m-0">
          {trackList.map((playlistTrackRelation) => (
            <li key={playlistTrackRelation.libraryTrack.uuid}>
              <TrackItem playlistLibTrackRelationObject={playlistTrackRelation} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

TrackListSidebar.propTypes = {};

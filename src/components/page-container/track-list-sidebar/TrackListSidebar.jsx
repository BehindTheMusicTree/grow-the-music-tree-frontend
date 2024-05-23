import TrackItem from "./track-item/TrackItem";
import { capitalizeFirstLetter } from "../../../utils";
import { useTrackList } from "../../../contexts/track-list/useTrackList";
import { useTrackListSidebarVisibility } from "../../../contexts/track-list-sidebar-visibility/useTrackListSidebarVisibility";
import { TRACK_LIST_ORIGIN_TYPE } from "../../../constants";

export default function TrackListSidebar() {
  const { trackList, origin } = useTrackList();
  const { setIsTrackListSidebarVisible } = useTrackListSidebarVisibility();

  return origin ? (
    <div className="track-list-sidebar absolute bottom-player right-0 w-144 rounded-2xl bg-gray-950">
      <div className="header flex h-16 px-4 py-2 text-gray-400">
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
        <div
          className="flex-grow flex flex-col items-end justify-center h-full cursor-pointer"
          onClick={() => setIsTrackListSidebarVisible(false)}
        >
          &#10005;
        </div>
      </div>
      {/* 80px is player height, 100px is the banner, 56px the track list header. */}
      {/* <ul className="track-list overflow-auto max-h-[calc(100%-180px-64px)] min-h-[calc((100%-180px-64px)/3)] list-none p-0 m-0"> */}
      <ul className="track-list overflow-auto max-h-[calc(100vh-180px-56px)] list-none p-0 m-0">
        {trackList.map((playlistTrackRelation) => (
          <li key={playlistTrackRelation.libraryTrack.uuid}>
            <TrackItem playlistLibTrackRelationObject={playlistTrackRelation} />
          </li>
        ))}
      </ul>{" "}
    </div>
  ) : (
    <div>Loading...</div>
  );
}

TrackListSidebar.propTypes = {};

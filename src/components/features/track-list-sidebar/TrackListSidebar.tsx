"use client";

import TrackItem from "./TrackItem";
import { capitalizeFirstLetter } from "@lib/utils/formatting";
import { useTrackList } from "@contexts/TrackListContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";

export default function TrackListSidebar() {
  const { trackList } = useTrackList();
  const { hideTrackListSidebar } = useTrackListSidebarVisibility();

  return trackList ? (
    <div className="track-list-sidebar absolute bottom-player right-0 w-144 rounded-2xl bg-gray-950 pb-1">
      <div className="header flex h-16 px-4 py-2 text-gray-400">
        <div className="origin flex text-xl ">
          <div className="from h-auto flex flex-col justify-center items-center mr-2">From</div>
          <div className="name-container flex flex-col justify-center items-center text-gray-300 font-bold pr-2 max-w-trackListName">
            <div className="name text-overflow">{trackList.origin.label}</div>
          </div>
        </div>
        <div className="info flex flex-col justify-center items-center text-m pt-1 mr-2">
          {trackList && trackList.origin.type === TrackListOriginType.PLAYLIST
            ? "• " + capitalizeFirstLetter(trackList.origin.type || "") + " playlist • "
            : "• track playlist • "}
          {trackList.uploadedTracks.length + " track" + (trackList.uploadedTracks.length > 1 ? "s •" : " •")}
        </div>
        <div
          className="flex-grow flex flex-col items-end justify-center h-full cursor-pointer"
          onClick={hideTrackListSidebar}
        >
          &#10005;
        </div>
      </div>
      {/* 80px is player height, 100px is the banner, 56px the track list header, 3.5px the track list bottom padding */}
      <ul className={"track-list overflow-auto max-h-[calc(100vh-180px-56px-3.5px)] list-none p-0 m-0"}>
        {trackList.uploadedTracks.map((track, index) => (
          <li key={track.uuid}>
            <TrackItem
              uploadedTrack={{
                uuid: track.uuid,
                title: track.title,
                artist: { name: track.artists.map((artist) => artist.name).join(", ") },
                file: {
                  durationInSec: track.file.durationInSec,
                },
              }}
              position={index + 1}
            />
          </li>
        ))}
      </ul>
    </div>
  ) : null;
}

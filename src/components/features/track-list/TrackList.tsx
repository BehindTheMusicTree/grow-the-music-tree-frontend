"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
}

interface TrackListProps {
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
}

export default function TrackList({ tracks, onTrackClick }: TrackListProps) {
  return (
    <div className="overflow-y-auto space-y-2" style={{ maxHeight: "calc(100vh - 143.5px)" }}>
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className="flex items-center p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
          onClick={() => onTrackClick?.(track)}
        >
          <div
            className="flex items-center justify-center w-16 text-gray-400 text-sm"
            style={{ minWidth: "64px", maxWidth: "64px" }}
          >
            {index + 1}
          </div>
          <Image src={track.albumArt} alt={track.title} width={48} height={48} className="w-12 h-12 rounded" />
          <div className="ml-4 flex-grow">
            <h3 className="font-bold text-white">{track.title}</h3>
            <p className="text-gray-400">{track.artist}</p>
          </div>
          <div
            className="flex items-center justify-center w-16 text-gray-400 text-sm"
            style={{ minWidth: "64px", maxWidth: "64px" }}
          >
            {track.duration}
          </div>
        </div>
      ))}
    </div>
  );
}

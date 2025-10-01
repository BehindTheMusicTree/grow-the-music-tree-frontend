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
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
          onClick={() => onTrackClick?.(track)}
        >
          <Image src={track.albumArt} alt={track.title} width={48} height={48} className="w-12 h-12 rounded" />
          <div className="ml-4 flex-grow">
            <h3 className="font-bold text-white">{track.title}</h3>
            <p className="text-gray-400">{track.artist}</p>
          </div>
          <span className="text-gray-400">{track.duration}</span>
        </div>
      ))}
    </div>
  );
}

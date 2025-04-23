export interface UploadedTrack {
  id: string;
  title: string;
  artist?: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    name: string;
  };
  genre?: {
    id: string;
    name: string;
  };
  rating?: number;
  file: {
    extension: string;
    bitrateInKbps: number;
    durationInSec: number;
  };
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackData {
  title?: string;
  artist?: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    name: string;
  };
  genre?: {
    id: string;
    name: string;
  };
  rating?: number;
}

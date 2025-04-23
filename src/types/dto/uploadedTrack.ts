export interface ApiUploadedTrackDto {
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
  created_on: string;
  updated_on: string;
}

export interface ApiTrackDataDto {
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

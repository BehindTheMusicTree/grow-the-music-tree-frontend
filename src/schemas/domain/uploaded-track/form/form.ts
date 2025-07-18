import { z } from "zod";

// TODO: Replace these with actual max lengths from your settings/constants
const UPLOADED_TRACK_TITLE_LEN_MAX = 255;
const ARTISTS_NAMES_LEN_MAX = 255;
const ALBUM_NAME_LEN_MAX = 255;
const ALBUM_ARTISTS_NAMES_FIELD_LEN_MAX = 255;
const LANGUAGE_LEN_MAX = 32;

const TrackNumberField = z.number().int().positive().optional();
const RatingField = z.number().min(0).max(5).optional(); // Example: 0-5 rating
const GenreField = z.string().optional().nullable(); // Accepts UUID or name

export const UploadedTrackFormSchema = z.object({
  track_file_fingerprint_must_be_unique: z.boolean().optional(),
  title: z.string().max(UPLOADED_TRACK_TITLE_LEN_MAX).optional().nullable(),
  force_title_generation: z.boolean().optional(),
  artists_names: z.string().max(ARTISTS_NAMES_LEN_MAX).optional().nullable(),
  album_name: z.string().max(ALBUM_NAME_LEN_MAX).optional().nullable(),
  album_artists_names: z.string().max(ALBUM_ARTISTS_NAMES_FIELD_LEN_MAX).optional().nullable(),
  track_number: TrackNumberField,
  genre: GenreField,
  rating: RatingField,
  language: z.string().max(LANGUAGE_LEN_MAX).optional().nullable(),
});

export type UploadedTrackFormValues = z.infer<typeof UploadedTrackFormSchema>;

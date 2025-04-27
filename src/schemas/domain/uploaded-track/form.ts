import { z } from "zod";
import {
  UPLOADED_TRACK_TITLE_LEN_MAX,
  ARTISTS_NAMES_LEN_MAX,
  ALBUM_NAME_LEN_MAX,
  ALBUM_ARTISTS_NAMES_FIELD_LEN_MAX,
  LANGUAGE_LEN_MAX,
} from "@lib/constants/domain";

export const UploadedTrackFormSchema = z.object({
  trackFileFingerprintMustBeUnique: z.boolean().optional(),
  title: z
    .string()
    .max(UPLOADED_TRACK_TITLE_LEN_MAX)
    .optional()
    .nullable()
    .refine((val) => val !== "", { message: "Title cannot be blank" }),
  forceTitleGeneration: z.boolean().optional(),
  artistsNames: z.array(z.string()).max(ARTISTS_NAMES_LEN_MAX).optional().nullable(),
  albumName: z.string().max(ALBUM_NAME_LEN_MAX).optional().nullable(),
  albumArtistsNames: z.array(z.string()).max(ALBUM_ARTISTS_NAMES_FIELD_LEN_MAX).optional().nullable(),
  trackNumber: z.number().int().positive().optional().nullable(),
  genre: z.string().uuid().optional().nullable().or(z.string().optional().nullable()), // Genre name or uuid
  rating: z.number().min(0).max(5).optional().nullable(),
  language: z.string().max(LANGUAGE_LEN_MAX).optional().nullable(),
});

export const UploadedTrackCreationSchema = UploadedTrackFormSchema.extend({
  file: z.instanceof(File),
});

export const UploadedTrackUpdateSchema = UploadedTrackFormSchema.extend({
  archived: z.boolean().optional(),
});

export type UploadedTrackCreationValues = z.infer<typeof UploadedTrackCreationSchema>;
export type UploadedTrackUpdateValues = z.infer<typeof UploadedTrackUpdateSchema>;

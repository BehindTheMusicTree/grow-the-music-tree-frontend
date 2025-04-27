import { z } from "zod";
import { GenreMinimumSchema } from "./response";

export const GenreLineageRelWithoutDescendantsSchema = z.object({
  ascendants: z.array(GenreMinimumSchema),
  degree: z.number(),
});

export const GenreLineageRelWithoutAscendantsSchema = z.object({
  descendants: z.array(GenreMinimumSchema),
  degree: z.number(),
});

export const GenreLineageRelSchema = GenreLineageRelWithoutDescendantsSchema.merge(
  GenreLineageRelWithoutAscendantsSchema
);

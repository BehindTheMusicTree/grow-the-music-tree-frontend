"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFetchWrapper } from "@hooks/useFetchWrapper";
import { CriteriaPlaylistSimpleSchema } from "@domain/playlist/criteria-playlist/simple";
import { CriteriaPlaylistDetailedSchema, CriteriaPlaylistDetailed } from "@domain/playlist/criteria-playlist/detailed";

import { PaginatedResponseSchema } from "@schemas/api/paginated-response";

export const useListGenrePlaylists = (page = 1, pageSize = process.env.NEXT_PUBLIC_GENRE_PLAYLISTS_PAGE_SIZE || 50) => {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();

  const query = useQuery({
    queryKey: ["genrePlaylists", page],
    queryFn: async () => {
      const response = await fetch("genre-playlists/", true, true, {}, { page, pageSize });
      console.log("response", response);
      const parseResult = PaginatedResponseSchema(CriteriaPlaylistSimpleSchema).safeParse(response);
      if (!parseResult.success) {
        console.error("Parsing failed:", parseResult.error);
        throw parseResult.error;
      }
      console.log("parseResult", parseResult.data);
      return parseResult.data;
    },
  });

  const invalidateGenrePlaylists = () => {
    queryClient.invalidateQueries({ queryKey: ["genrePlaylists"] });
  };

  return {
    ...query,
    invalidateGenrePlaylists,
  };
};

export const useRetrieveGenrePlaylist = (uuid: string) => {
  const { fetch } = useFetchWrapper();
  return useQuery<CriteriaPlaylistDetailed>({
    queryKey: ["genrePlaylists", uuid],
    queryFn: async () => {
      const response = await fetch(`genre-playlists/${uuid}`, true);
      return CriteriaPlaylistDetailedSchema.parse(response);
    },
  });
};

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";

import { useFetchWrapper } from "./useFetchWrapper";
import { useListGenrePlaylists } from "@hooks/useGenrePlaylist";
import { PaginatedResponseSchema } from "@schemas/api/paginated-response";
import { CriteriaDetailedSchema, CriteriaDetailed } from "@schemas/domain/criteria/response/detailed";
import { CriteriaSimpleSchema } from "@schemas/domain/criteria/response/simple";
import { criteriaCreationValues, CriteriaCreationSchema } from "@schemas/domain/criteria/form/creation";
import { CriteriaUpdateValues, CriteriaUpdateSchema } from "@schemas/domain/criteria/form/update";
import { ErrorResponseSchema } from "@schemas/api/error-response";
import { InvalidInputError } from "@app-types/app-errors/app-error";

export function useListGenres(page = 1, pageSize = process.env.NEXT_PUBLIC_GENRES_PAGE_SIZE || 50) {
  const { fetch } = useFetchWrapper();

  return useQuery({
    queryKey: ["genres", "list", page],
    queryFn: async () => {
      const response = await fetch("genre/", true, true, {}, { page, pageSize });
      return PaginatedResponseSchema(CriteriaSimpleSchema).parse(response);
    },
  });
}

export function useRetrieveGenre(id: string) {
  const { fetch } = useFetchWrapper();

  return useQuery<CriteriaDetailed>({
    queryKey: ["genres", "detail", id],
    queryFn: async () => {
      const response = await fetch(`genre/${id}`, true);
      return CriteriaDetailedSchema.parse(response);
    },
  });
}

function mapGenreFormToPayload<T extends { parentUuid?: string }>(formData: T) {
  const { parentUuid, ...rest } = formData;
  return {
    ...rest,
    parent: parentUuid,
  };
}

export function useLoadReferenceTreeGenre() {
  const { fetch } = useFetchWrapper();
  const queryClient = useQueryClient();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch("genres/tree/load-reference/", true, true, {
        method: "POST",
      });
      const parseResult = CriteriaDetailedSchema.safeParse(response);
      if (!parseResult.success) {
        throw new Error("Failed to parse response");
      }
      return parseResult.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateGenrePlaylists();
    },
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();
  const { fetch } = useFetchWrapper();
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  const mutate = useMutation<CriteriaDetailed | null, Error, criteriaCreationValues>({
    mutationFn: async (data: unknown) => {
      try {
        const validatedData = CriteriaCreationSchema.safeParse(data);
        if (!validatedData.success) {
          throw new Error("Invalid data");
        }
        const response = await fetch("genres/", true, true, {
          method: "POST",
          body: JSON.stringify(validatedData.data),
        });
        if (!response) {
          throw new Error("No response received from server");
        }
        console.log("response", response);
        const parseResult = CriteriaDetailedSchema.safeParse(response);
        if (!parseResult.success) {
          console.error("Parsing failed:", parseResult.error);
          throw parseResult.error;
        }
        console.log("parseResult", parseResult.data);
        return parseResult.data;
      } catch (error) {
        if (error instanceof InvalidInputError) {
          try {
            const errorResponse = ErrorResponseSchema.parse(error.json);
            setFormErrors(
              Object.entries(errorResponse.details.fieldErrors || {}).flatMap(([field, errors]) =>
                errors.map((err) => ({
                  field,
                  message: err.message,
                }))
              )
            );
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            setFormErrors([{ field: "genre", message: "An error occurred while creating the genre" }]);
          }
        } else if (error instanceof ZodError) {
          console.log("zod error");
          const fieldErrors = error.errors.map((error) => ({
            field: error.path.join("."),
            message: error.message,
          }));
          setFormErrors(fieldErrors);
        }
        return null;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      invalidateGenrePlaylists();
    },
  });

  return { ...mutate, formErrors };
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  const mutate = useMutation<CriteriaDetailed, Error, { uuid: string; data: CriteriaUpdateValues }>({
    mutationFn: async ({ uuid, data }) => {
      const payload = mapGenreFormToPayload(data);
      const response = await fetch(`genres/${uuid}`, true, true, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return CriteriaDetailedSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
      invalidateGenrePlaylists();
    },
    onError: (error) => {
      try {
        const errorResponse = ErrorResponseSchema.parse(error);
        setFormErrors(
          Object.entries(errorResponse.details.fieldErrors || {}).flatMap(([field, errors]) =>
            errors.map((err) => ({
              field,
              message: err.message,
            }))
          )
        );
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        setFormErrors([{ field: "genre", message: "An error occurred while updating the genre" }]);
      }
    },
  });

  const renameGenre = (uuid: string, name: string) => {
    mutate.mutate({ uuid, data: { name } });
  };

  const updateGenreParent = (uuid: string, parentUuid: string) => {
    mutate.mutate({ uuid, data: { parent: parentUuid } });
  };

  return { mutate, renameGenre, updateGenreParent, formErrors };
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper();
  const { invalidateGenrePlaylists } = useListGenrePlaylists();
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  return useMutation<CriteriaDetailed, Error, { uuid: string }>({
    mutationFn: async ({ uuid }) => {
      const response = await fetch(`genres/${uuid}`, true, true, {
        method: "DELETE",
      });
      return CriteriaDetailedSchema.parse(response);
    },
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      queryClient.invalidateQueries({ queryKey: ["genres", "detail", uuid] });
      invalidateGenrePlaylists();
    },
    onError: (error) => {
      try {
        const errorResponse = ErrorResponseSchema.parse(error);
        setFormErrors(
          Object.entries(errorResponse.details.fieldErrors || {}).flatMap(([field, errors]) =>
            errors.map((err) => ({
              field,
              message: err.message,
            }))
          )
        );
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        setFormErrors([{ field: "genre", message: "An error occurred while deleting the genre" }]);
      }
    },
  });
}

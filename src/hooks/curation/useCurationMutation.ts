"use client";

import { hashKey, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import { useFetchWrapper, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

type Fetch = ReturnType<typeof useFetchWrapper>["fetch"];

const CURATION_QUERY_ROOTS = new Set(["referenceSongs", "referenceGenres", "referenceGenrePlaylists"]);
const isCurationQuery = (key: QueryKey) => typeof key[0] === "string" && CURATION_QUERY_ROOTS.has(key[0]);

interface CurationMutationConfig<I, O> {
  inputSchema: z.ZodType<I, unknown>;
  outputSchema: z.ZodType<O, unknown>;
  request: (fetch: Fetch, input: I) => Promise<unknown>;
  optimistic?: (queryClient: QueryClient, input: I) => QueryKey[];
  undo?: (input: I, output: O) => I | null;
  message: (input: I) => string;
  pendingLabel: (input: I) => string;
}

export function useCurationMutation<I, O>(
  config: CurationMutationConfig<I, O>,
) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const queryClient = useQueryClient();

  const mutation = useValidatedMutation({
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    mutationFn: (input: I) => config.request(fetch, input),
    meta: { pendingLabel: (input: unknown) => config.pendingLabel(input as I) },
    onMutate: async (input: I) => {
      await queryClient.cancelQueries({ predicate: (query) => isCurationQuery(query.queryKey) });
      const snapshot = queryClient.getQueriesData({ predicate: (query) => isCurationQuery(query.queryKey) });
      const touched = new Set((config.optimistic?.(queryClient, input) ?? []).map((key) => hashKey(key)));
      return { snapshot: snapshot.filter(([key]) => touched.has(hashKey(key))) };
    },
    onError: (error: Error, _input: I, context?: { snapshot: [QueryKey, unknown][] }) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData<unknown>(key, data));
      toast.error(error.message);
    },
    onSuccess: (output: O, input: I) => {
      const inverse = config.undo?.(input, output) ?? null;
      toast.success(config.message(input), {
        action: inverse ? { label: "Undo", onClick: () => mutation.mutate(inverse) } : undefined,
      });
    },
    onSettled: () => queryClient.invalidateQueries({ predicate: (query) => isCurationQuery(query.queryKey) }),
  });
  return mutation;
}

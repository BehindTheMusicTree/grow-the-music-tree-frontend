import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { parseWithLog } from "@lib/parse-with-log";

type UseQueryWithParseOptions<T> = Omit<UseQueryOptions<T, Error, T>, "queryFn"> & {
  queryFn: () => Promise<unknown>;
  schema: z.ZodType<T>;
  context?: string;
};

export function useQueryWithParse<T>({
  queryFn,
  schema,
  context,
  ...options
}: UseQueryWithParseOptions<T>) {
  return useQuery({
    ...options,
    queryFn: async () => {
      const response = await queryFn();
      return parseWithLog(schema, response, context);
    },
  });
}

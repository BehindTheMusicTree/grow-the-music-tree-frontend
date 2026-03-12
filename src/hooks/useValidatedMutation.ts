/**
 * React Query mutation hook with Zod validation for input and output, and form error handling.
 *
 * - Validates `variables` with `inputSchema` before calling `mutationFn`; on failure sets
 *   `formErrors` and throws so the mutation is not sent.
 * - Validates the API response with `outputSchema`; on failure sets `formErrors` and throws.
 * - If the API returns an error with a `.json` body shaped like
 *   `{ details: { fieldErrors: Record<string, { message: string }[]> } }`, those are mapped
 *   into `formErrors` for display.
 *
 * Use when you need client-side validation of form input, response validation, and/or
 * display of server-side field errors (e.g. form submissions).
 *
 * @returns The same object as `useMutation` plus `formErrors: { field: string; message: string }[]`.
 */
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

type FieldError = {
  field: string;
  message: string;
};

type ValidatedMutationOptions<TData, TError, TVariables, TContext> = Omit<
  UseMutationOptions<TData, TError, TVariables, TContext>,
  "mutationFn"
> & {
  inputSchema: z.ZodType<TVariables>;
  outputSchema: z.ZodType<TData>;
  mutationFn: (data: TVariables) => Promise<unknown>;
};

/**
 * Mutation hook with Zod validation and form error handling. See file-level JSDoc above.
 *
 * @template TData - Type of the mutation result (validated by outputSchema).
 * @template TError - Type of the mutation error (default: Error).
 * @template TVariables - Type of the variables passed to mutate() (validated by inputSchema).
 * @template TContext - Type of the context passed to useMutation (e.g. in onMutate).
 * @param options - Options for the validated mutation (and any useMutation options).
 * @param options.inputSchema - Zod schema to validate variables before calling mutationFn.
 * @param options.outputSchema - Zod schema to validate the API response.
 * @param options.mutationFn - Async function that performs the request; receives validated variables.
 * @returns useMutation result plus formErrors: { field: string; message: string }[].
 */
export function useValidatedMutation<TData, TError = Error, TVariables = unknown, TContext = unknown>({
  inputSchema,
  outputSchema,
  mutationFn,
  ...options
}: ValidatedMutationOptions<TData, TError, TVariables, TContext>) {
  const [formErrors, setFormErrors] = useState<FieldError[]>([]);

  const validatedMutation = useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn: async (data) => {
      const parsedInput = inputSchema.safeParse(data);
      if (!parsedInput.success) {
        const fieldErrors = parsedInput.error.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        }));
        setFormErrors(fieldErrors);
        throw new Error("Invalid input data");
      }

      try {
        const response = await mutationFn(parsedInput.data);
        const parsedOutput = outputSchema.safeParse(response);
        if (!parsedOutput.success) {
          console.error("Output validation failed:", parsedOutput.error);
          setFormErrors([{ field: "form", message: "Invalid response from server" }]);
          throw new Error("Invalid response from server");
        }
        return parsedOutput.data;
      } catch (error) {
        if (error instanceof Error && "json" in error) {
          try {
            const errorResponse = z
              .object({
                details: z.object({
                  fieldErrors: z.record(z.array(z.object({ message: z.string() }))),
                }),
              })
              .parse(error.json);

            setFormErrors(
              Object.entries(errorResponse.details.fieldErrors || {}).flatMap(([field, errors]) =>
                errors.map((err) => ({
                  field,
                  message: err.message,
                })),
              ),
            );
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
            setFormErrors([{ field: "form", message: "An error occurred" }]);
          }
        }
        throw error;
      }
    },
  });

  return { ...validatedMutation, formErrors };
}

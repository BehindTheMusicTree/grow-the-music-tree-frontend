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

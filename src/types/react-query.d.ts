import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      blocking?: boolean;
      pendingLabel?: (variables: unknown) => string;
    };
  }
}

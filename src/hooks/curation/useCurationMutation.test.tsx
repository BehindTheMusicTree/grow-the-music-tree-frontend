import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useCurationMutation } from "./useCurationMutation";

const fetchMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({ toast: { success: (...args: unknown[]) => toastSuccess(...args), error: (...args: unknown[]) => toastError(...args) } }));
vi.mock("@lib/site-urls", () => ({ getGrowBackendBaseUrl: () => "/api" }));
vi.mock("@behindthemusictree/app-kit/transport", () => ({
  useFetchWrapper: () => ({ fetch: fetchMock }),
  useValidatedMutation: (options: Parameters<typeof useMutation>[0]) => useMutation(options),
}));

const KEY = ["referenceRecordings", "/api", "genre", "g1"];
const Schema = z.object({ value: z.string() });

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(KEY, "original");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    () =>
      useCurationMutation({
        inputSchema: Schema,
        outputSchema: z.object({ previous: z.string() }),
        request: (fetch, input) => fetch("x/", true, false, { body: input.value }),
        optimistic: (client, input) => {
          client.setQueryData<string>(KEY, input.value);
          return [KEY];
        },
        undo: (_input, output) => ({ value: output.previous }),
        message: (input) => `set ${input.value}`,
        pendingLabel: (input) => `Setting ${input.value}…`,
      }),
    { wrapper },
  );
  return { queryClient, hook };
}

describe("useCurationMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rolls back the optimistic update and toasts the error on failure", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));
    const { queryClient, hook } = setup();

    act(() => hook.result.current.mutate({ value: "changed" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("boom"));
    expect(queryClient.getQueryData(KEY)).toBe("original");
  });

  it("offers Undo that sends the inverse input", async () => {
    fetchMock.mockResolvedValue({ previous: "original" });
    const { hook } = setup();

    act(() => hook.result.current.mutate({ value: "changed" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const options = toastSuccess.mock.calls[0][1] as { action: { label: string; onClick: () => void } };
    expect(options.action.label).toBe("Undo");

    act(() => options.action.onClick());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][3]).toEqual({ body: "original" });
  });

  it("does not restore keys it did not touch when a mutation fails", async () => {
    const other = ["referenceRecordings", "/api", "genre", "g2"];
    fetchMock.mockImplementation(async () => {
      throw new Error("boom");
    });
    const { queryClient, hook } = setup();
    queryClient.setQueryData(other, "original");

    act(() => hook.result.current.mutate({ value: "changed" }));
    queryClient.setQueryData(other, "newer");

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("boom"));
    expect(queryClient.getQueryData(KEY)).toBe("original");
    expect(queryClient.getQueryData(other)).toBe("newer");
  });

  it("exposes the pending label as mutation meta", async () => {
    fetchMock.mockResolvedValue({ previous: "original" });
    const { queryClient, hook } = setup();

    act(() => hook.result.current.mutate({ value: "changed" }));

    const [mutation] = queryClient.getMutationCache().getAll();
    expect(mutation.meta?.pendingLabel?.({ value: "changed" })).toBe("Setting changed…");
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
  });

  it("stays pending until the invalidation refetch finishes", async () => {
    fetchMock.mockResolvedValue({ previous: "original" });
    const { queryClient, hook } = setup();
    let finishRefetch: () => void = () => {};
    vi.spyOn(queryClient, "invalidateQueries").mockReturnValue(new Promise<void>((resolve) => (finishRefetch = resolve)));

    act(() => hook.result.current.mutate({ value: "changed" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    expect(hook.result.current.isPending).toBe(true);
    await act(async () => finishRefetch());
    await waitFor(() => expect(hook.result.current.isPending).toBe(false));
  });
});

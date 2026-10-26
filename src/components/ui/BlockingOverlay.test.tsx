import { describe, it, expect, vi, afterEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen, act, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, useMutation } from "@tanstack/react-query";
import BlockingOverlay from "@components/ui/BlockingOverlay";

vi.mock("@behindthemusictree/ui", () => ({ RingLoader: () => <div /> }));

function Trigger({ blocking }: { blocking?: boolean }) {
  const { mutate } = useMutation({
    mutationFn: () => new Promise<void>((resolve) => resolvers.push(resolve)),
    meta: { blocking, pendingLabel: () => "Moving under X…" },
  });
  return <button onClick={() => mutate()}>go</button>;
}

const resolvers: (() => void)[] = [];

function setup(blocking?: boolean) {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(
    <>
      <main>
        <Trigger blocking={blocking} />
      </main>
      <BlockingOverlay />
    </>,
    { wrapper },
  );
  return queryClient;
}

const start = () => act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "go" }));
  });
const finish = () => act(async () => resolvers.splice(0).forEach((resolve) => resolve()));

describe("BlockingOverlay", () => {
  afterEach(() => {
    cleanup();
    resolvers.length = 0;
    vi.useRealTimers();
  });

  it("renders nothing when idle", () => {
    setup();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows the label and makes the rest of the app inert while a mutation is pending", async () => {
    setup();
    await start();
    expect(await screen.findByRole("status")).toHaveTextContent("Moving under X…");
    expect(screen.getByRole("main").parentElement).toHaveProperty("inert", true);
    await finish();
    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
    expect(screen.getByRole("main").parentElement).toHaveProperty("inert", false);
  });

  it("keeps Escape from reaching document listeners", async () => {
    setup();
    const onKeyDown = vi.fn();
    document.addEventListener("keydown", onKeyDown);
    await start();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    });
    expect(onKeyDown).not.toHaveBeenCalled();
    document.removeEventListener("keydown", onKeyDown);
    await finish();
  });

  it("shows the elapsed time after 3 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setup();
    await start();
    expect(await screen.findByRole("status")).not.toHaveTextContent(" s");
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Moving under X… · 4 s");
    await finish();
  });

  it("does not block mutations that opt out", async () => {
    setup(false);
    await start();
    expect(screen.queryByRole("status")).toBeNull();
    await finish();
  });
});

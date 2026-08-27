import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

vi.mock("@lib/grow-api-upstream-url", () => ({
  getGrowApiUpstreamBaseUrl: () => "https://grow-api-staging.themusictree.org/v0",
}));

function makeContext(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("grow-proxy route", () => {
  const originalApiKey = process.env.GTMT_API_KEY;

  beforeEach(() => {
    process.env.GTMT_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.GTMT_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("forwards GET requests to the upstream URL with a trailing slash and query string, sending the API key and no body", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));

    const request = new NextRequest("http://localhost/api/grow-proxy/genres/?foo=bar");
    const response = await GET(request, makeContext(["genres"]));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://grow-api-staging.themusictree.org/v0/genres/?foo=bar");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Record<string, string>)["X-API-Key"]).toBe("test-api-key");
    expect(init?.body).toBeUndefined();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("forwards POST requests with the body and Content-Type along with the API key", async () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ created: true }), { status: 201, headers: { "content-type": "application/json" } }));

    const request = new NextRequest("http://localhost/api/grow-proxy/genres/tree/load-example/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "example" }),
    });
    const response = await POST(request, makeContext(["genres", "tree", "load-example"]));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://grow-api-staging.themusictree.org/v0/genres/tree/load-example/");
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string>;
    expect(headers["X-API-Key"]).toBe("test-api-key");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init?.body).toBeInstanceOf(ArrayBuffer);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ created: true });
  });

  it("passes through a non-2xx upstream status and body unchanged", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "not found" }), { status: 404, headers: { "content-type": "application/json" } })
    );

    const request = new NextRequest("http://localhost/api/grow-proxy/genres/missing/");
    const response = await GET(request, makeContext(["genres", "missing"]));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ detail: "not found" });
  });

  it("throws before fetching when GTMT_API_KEY is missing", async () => {
    delete process.env.GTMT_API_KEY;
    const fetchMock = vi.spyOn(global, "fetch");

    const request = new NextRequest("http://localhost/api/grow-proxy/genres/");
    await expect(GET(request, makeContext(["genres"]))).rejects.toThrow("GTMT_API_KEY is required");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

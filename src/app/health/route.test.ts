import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const request = new Request("http://localhost/health");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ status: "ok" });
  });
});

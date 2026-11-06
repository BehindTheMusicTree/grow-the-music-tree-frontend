import { timingSafeEqual } from "node:crypto";

export function viewerContextHeaders(headers: Headers): Record<string, string> {
  const edgeToken = process.env.EDGE_VIEWER_CONTEXT_TOKEN;
  const apiToken = process.env.VIEWER_CONTEXT_TOKEN;
  if (!edgeToken && !apiToken) return {};
  if (!edgeToken || !apiToken) throw new Error("Both viewer context tokens must be configured");
  const supplied = Buffer.from(headers.get("x-btmt-edge-token") ?? "");
  const expected = Buffer.from(edgeToken);
  const country = headers.get("cf-ipcountry");
  const trusted = supplied.length === expected.length && timingSafeEqual(supplied, expected);
  return {
    "X-Viewer-Context-Token": apiToken,
    ...(trusted && country && /^[A-Z]{2}$/.test(country) && country !== "XX"
      ? { "X-Viewer-Country": country }
      : {}),
  };
}

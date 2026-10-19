const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);

export function extractYoutubeId(input: string): string | null {
  const text = input.trim();
  if (VIDEO_ID.test(text)) return text;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  const segments = url.pathname.split("/").filter(Boolean);
  const candidate =
    url.hostname === "youtu.be"
      ? segments[0]
      : segments[0] === "watch"
        ? url.searchParams.get("v")
        : ["shorts", "embed", "live"].includes(segments[0] ?? "")
          ? segments[1]
          : null;
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

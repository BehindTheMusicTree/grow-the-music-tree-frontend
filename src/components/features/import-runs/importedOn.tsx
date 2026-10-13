const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});
const RELATIVE_FORMAT = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export function formatRelative(iso: string, now: number) {
  const seconds = (Date.parse(iso) - now) / 1000;
  const [unit, size] = UNITS.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1];
  return RELATIVE_FORMAT.format(Math.round(seconds / size), unit);
}

/** Elapsed time from `startIso` to `end` (an ISO date or epoch ms), e.g. "42 s", "3 min", "2 h 05 min". */
export function formatDuration(startIso: string, end: string | number) {
  const seconds = Math.max(0, Math.floor(((typeof end === "number" ? end : Date.parse(end)) - Date.parse(startIso)) / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}

export function AbsoluteTime({ iso }: { iso: string }) {
  return <time dateTime={iso}>{DATE_FORMAT.format(new Date(iso))}</time>;
}

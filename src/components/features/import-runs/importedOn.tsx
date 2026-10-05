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

export function AbsoluteTime({ iso }: { iso: string }) {
  return <time dateTime={iso}>{DATE_FORMAT.format(new Date(iso))}</time>;
}

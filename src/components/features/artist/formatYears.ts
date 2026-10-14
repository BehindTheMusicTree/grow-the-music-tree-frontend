/** "1994–present", "1994–2008", "?–2008", or null when nothing is known. */
export function formatYears(beginYear: number | null, endYear: number | null, ended: boolean): string | null {
  if (beginYear === null && endYear === null) return ended ? "ended" : null;
  const end = endYear ?? (ended ? "?" : "present");
  return `${beginYear ?? "?"}–${end}`;
}

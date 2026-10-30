export const formatYear = (year: number | null) => (year === null ? "?" : year < 0 ? `${-year} BCE` : String(year));

export const formatSpan = (start: number | null, end: number | null) => `${formatYear(start)} – ${formatYear(end)}`;

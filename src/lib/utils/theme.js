export const STYLE = getComputedStyle(document.documentElement);
export const PRIMARY_COLOR = STYLE.getPropertyValue("--primary").trim();
export const SECONDARY_COLOR = STYLE.getPropertyValue("--secondary").trim();

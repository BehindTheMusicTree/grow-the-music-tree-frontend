const style = getComputedStyle(document.documentElement);
export const PRIMARY_COLOR = style.getPropertyValue("--primary").trim();
export const SECONDARY_COLOR = style.getPropertyValue("--secondary").trim();
console.log(PRIMARY_COLOR, SECONDARY_COLOR);

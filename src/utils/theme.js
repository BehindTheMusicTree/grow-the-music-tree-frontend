const getThemeColors = () => {
  if (typeof window === "undefined") {
    return {
      primary: "#0d3b66",
      secondary: "#85c1e9",
    };
  }
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue("--primary").trim(),
    secondary: style.getPropertyValue("--secondary").trim(),
  };
};

export const { primary: PRIMARY_COLOR, secondary: SECONDARY_COLOR } = getThemeColors();

export const formatTime = (seconds: number) => {
  const minutes: number = Math.floor(seconds / 60);
  const secs: number = Math.floor(seconds % 60);
  let secsStr: string = secs.toString();
  if (secs < 10) {
    secsStr = "0" + secsStr;
  }
  return `${minutes}:${secsStr}`;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

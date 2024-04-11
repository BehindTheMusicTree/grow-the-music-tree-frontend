export const formatTime = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) { secs = "0" + secs; }
    return `${minutes}:${secs}`;
}
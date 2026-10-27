import { useEffect, useRef } from "react";

interface CenterColumnSurfaces {
  about: boolean;
  closeAbout: () => void;
  detailExpanded: boolean;
  setDetailExpanded: (expanded: boolean) => void;
  tracklistExpanded: boolean;
  setTracklistExpanded: (expanded: boolean) => void;
}

/** The center column holds one surface at a time: the About panel, the expanded detail panel or the expanded tracklist. Whichever opens last closes the others. */
export function useCenterColumn(surfaces: CenterColumnSurfaces) {
  const latest = useRef(surfaces);
  latest.current = surfaces;
  const { about, detailExpanded, tracklistExpanded } = surfaces;

  useEffect(() => {
    if (!about) return;
    latest.current.setDetailExpanded(false);
    latest.current.setTracklistExpanded(false);
  }, [about]);

  useEffect(() => {
    if (!detailExpanded) return;
    latest.current.closeAbout();
    latest.current.setTracklistExpanded(false);
  }, [detailExpanded]);

  useEffect(() => {
    if (!tracklistExpanded) return;
    latest.current.closeAbout();
    latest.current.setDetailExpanded(false);
  }, [tracklistExpanded]);
}

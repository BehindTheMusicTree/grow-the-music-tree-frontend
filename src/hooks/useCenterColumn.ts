import { useEffect, useRef } from "react";

interface CenterColumnSurfaces {
  about: boolean;
  closeAbout: () => void;
  detailExpanded: boolean;
  setDetailExpanded: (expanded: boolean) => void;
  tracklistExpanded: boolean;
  setTracklistExpanded: (expanded: boolean) => void;
}

/** The center column holds one surface at a time: the About panel, the expanded detail panel or the expanded tracklist. Whichever opens last closes the others; an About already open on mount counts as the latest. */
export function useCenterColumn(surfaces: CenterColumnSurfaces) {
  const latest = useRef(surfaces);
  latest.current = surfaces;
  const { about, detailExpanded, tracklistExpanded } = surfaces;
  const prev = useRef({ about: false, detailExpanded, tracklistExpanded });

  useEffect(() => {
    const before = prev.current;
    prev.current = { about, detailExpanded, tracklistExpanded };
    const { closeAbout, setDetailExpanded, setTracklistExpanded } = latest.current;

    if (about && !before.about) {
      setDetailExpanded(false);
      setTracklistExpanded(false);
    } else if (detailExpanded && !before.detailExpanded) {
      if (about) closeAbout();
      setTracklistExpanded(false);
    } else if (tracklistExpanded && !before.tracklistExpanded) {
      if (about) closeAbout();
      setDetailExpanded(false);
    }
  }, [about, detailExpanded, tracklistExpanded]);
}

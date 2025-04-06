import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";

import Page from "../../models/Page";
import { PAGE_TYPES } from "../../utils/constants";

export const PageContext = createContext();

export function PageProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(() => {
    // Initialize page state based on current URL
    const path = location.pathname;
    if (path === "/genre-playlists") {
      return new Page(PAGE_TYPES.GENRE_PLAYLISTS, null);
    } else if (path === "/uploaded-library") {
      return new Page(PAGE_TYPES.UPLOADED_LIBRARY, null);
    } else if (path === "/spotify-library") {
      return new Page(PAGE_TYPES.SPOTIFY_LIBRARY, null);
    }
    // Default to genre playlists
    return new Page(PAGE_TYPES.GENRE_PLAYLISTS, null);
  });

  // Update URL when page changes
  useEffect(() => {
    let path = "/";
    switch (page.type) {
      case PAGE_TYPES.GENRE_PLAYLISTS:
        path = "/genre-playlists";
        break;
      case PAGE_TYPES.UPLOADED_LIBRARY:
        path = "/uploaded-library";
        break;
      case PAGE_TYPES.SPOTIFY_LIBRARY:
        path = "/spotify-library";
        break;
    }
    if (location.pathname !== path) {
      navigate(path);
    }
  }, [page, navigate, location.pathname]);

  // Update page state when URL changes
  useEffect(() => {
    const path = location.pathname;
    let newPage;
    if (path === "/genre-playlists") {
      newPage = new Page(PAGE_TYPES.GENRE_PLAYLISTS, null);
    } else if (path === "/uploaded-library") {
      newPage = new Page(PAGE_TYPES.UPLOADED_LIBRARY, null);
    } else if (path === "/spotify-library") {
      newPage = new Page(PAGE_TYPES.SPOTIFY_LIBRARY, null);
    } else {
      newPage = new Page(PAGE_TYPES.GENRE_PLAYLISTS, null);
    }
    if (newPage.type !== page.type) {
      setPage(newPage);
    }
  }, [location.pathname, page.type]);

  return <PageContext.Provider value={{ page, setPage }}>{children}</PageContext.Provider>;
}

PageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Page from "@models/Page";
import { PAGE_TYPES } from "@utils/constants";

export const PageContext = createContext();

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}

export function PageProvider({ children }) {
  const [page, setPage] = useState(new Page(PAGE_TYPES.GENRE_PLAYLISTS));
  const location = useLocation();

  // Sync route to page state
  useEffect(() => {
    // Synchronize route path with page context
    switch (location.pathname) {
      case "/":
      case "/genre-playlists":
        setPage(new Page(PAGE_TYPES.GENRE_PLAYLISTS));
        break;
      case "/uploaded-library":
        setPage(new Page(PAGE_TYPES.UPLOADED_LIBRARY));
        break;
      case "/spotify-library":
        setPage(new Page(PAGE_TYPES.SPOTIFY_LIBRARY));
        break;
      case "/account":
        setPage(new Page(PAGE_TYPES.ACCOUNT));
        break;
      default:
        // Handle other routes if needed
        break;
    }
  }, [location.pathname]);

  return (
    <PageContext.Provider
      value={{
        page,
        setPage,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

PageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import Page from "@models/Page";
import { PAGE_TYPES } from "@utils/constants";

export const NextPageContext = createContext();

export function useNextPage() {
  const context = useContext(NextPageContext);
  if (!context) {
    throw new Error("useNextPage must be used within a NextPageProvider");
  }
  return context;
}

export function NextPageProvider({ children }) {
  const [page, setPage] = useState(new Page(PAGE_TYPES.GENRE_PLAYLISTS));
  const router = useRouter();

  // Sync route to page state when using Next.js router
  useEffect(() => {
    // Only run once router is ready
    if (!router.isReady) return;

    // Synchronize route path with page context
    const pathname = router.pathname;
    switch (pathname) {
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
        // Other routes maintain current page state
        break;
    }
  }, [router.isReady, router.pathname]);

  return (
    <NextPageContext.Provider
      value={{
        page,
        setPage,
      }}
    >
      {children}
    </NextPageContext.Provider>
  );
}

NextPageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
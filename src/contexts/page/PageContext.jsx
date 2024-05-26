import { createContext, useState } from "react";
import PropTypes from "prop-types";

import Page from "../../models/Page";
import { PAGE_TYPES } from "../../utils/constants";

export const PageContext = createContext();

export function PageProvider({ children }) {
  const [page, setPage] = useState(new Page(PAGE_TYPES.GENRE_PLAYLISTS, null));

  return <PageContext.Provider value={{ page, setPage }}>{children}</PageContext.Provider>;
}

PageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

export const PageContext = createContext();

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}

export function PageProvider({ children }) {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <PageContext.Provider
      value={{
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}

PageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

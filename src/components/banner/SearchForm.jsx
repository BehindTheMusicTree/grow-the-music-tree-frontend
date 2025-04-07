import { useState } from "react";
import PropTypes from "prop-types";
import { FaSearch } from "react-icons/fa";

const logApiCall = (action, data) => {
  console.log(`API ${action}:`, {
    timestamp: new Date().toISOString(),
    action,
    data,
  });
};

export default function SearchForm({ setSearchSubmitted }) {
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [searchUnsubmitted, setSearchUnsubmitted] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = e.target.value;
    if (value === "") {
      alert("Please enter a search term");
      return;
    }

    try {
      logApiCall("SEARCH_START", { query: searchUnsubmitted });
      await setSearchSubmitted(searchUnsubmitted);
      logApiCall("SEARCH_SUCCESS", { query: searchUnsubmitted });
    } catch (error) {
      logApiCall("SEARCH_ERROR", { query: searchUnsubmitted, error: error.message });
      console.error("Search failed:", error);
    }
  };

  const handleFocus = () => {
    if (isFirstFocus) {
      setSearchUnsubmitted("");
      setIsFirstFocus(false);
    }
  };

  const handleChange = (e) => {
    setSearchUnsubmitted(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        className="text-gray-900 p-2 pl-10 rounded-md border-2 border-gray-900 w-60 h-10"
        type="text"
        name="search"
        placeholder="Search library or dig..."
        onChange={handleChange}
        value={searchUnsubmitted}
        onFocus={handleFocus}
      />
    </form>
  );
}

SearchForm.propTypes = {
  setSearchSubmitted: PropTypes.func.isRequired,
};

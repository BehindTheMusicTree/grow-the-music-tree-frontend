"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { FaSearch } from "react-icons/fa";

export default function SearchForm() {
  const [isFirstFocus, setIsFirstFocus] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = e.target.value;
    if (value === "") {
      alert("Please enter a search term");
      return;
    }
  };

  const handleFocus = () => {
    if (isFirstFocus) {
      setIsFirstFocus(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        className="text-gray-900 p-2 pl-10 rounded-md border-2 border-gray-900 w-60 h-10"
        type="text"
        name="search"
        placeholder="Search library or dig..."
        onFocus={handleFocus}
      />
    </form>
  );
}

SearchForm.propTypes = {
  setSearchSubmitted: PropTypes.func.isRequired,
};

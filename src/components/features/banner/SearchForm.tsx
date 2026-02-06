"use client";

import { useState, FormEvent } from "react";
import { FaSearch } from "react-icons/fa";

interface SearchFormProps {
  setSearchSubmitted?: (value: string) => void;
}

export default function SearchForm({ setSearchSubmitted }: SearchFormProps) {
  const [isFirstFocus, setIsFirstFocus] = useState(true);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const value = (form.elements.namedItem("search") as HTMLInputElement).value;
    if (value === "") {
      alert("Please enter a search term");
      return;
    }
    setSearchSubmitted?.(value);
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

import PropTypes from "prop-types";

import SearchForm from "./SearchForm";
import logo from "../../assets/images/logos/umg-logo-maze-100.svg";

export default function Banner({ setSearchSubmitted }) {
  return (
    <div className="h-banner p-3 flex bg-black text-gray-100">
      <div className="mr-3 flex flex-col justify-center">
        <img src={logo} alt="logo" />
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-bold">Ultimate Music Guide</h1>
        <h3>by Bodzify</h3>
      </div>
      <div className="filler flex-grow" />
      <div className="search w-64 flex flex-col justify-center">
        <SearchForm setSearchSubmitted={setSearchSubmitted} />
      </div>
    </div>
  );
}

Banner.propTypes = {
  searchSubmitted: PropTypes.string.isRequired,
  setSearchSubmitted: PropTypes.func.isRequired,
};

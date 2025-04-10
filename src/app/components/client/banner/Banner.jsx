import PropTypes from "prop-types";

import SearchForm from "./SearchForm";
import logo from "@assets/images/logos/umg-logo-maze-100.svg";

export default function Banner() {
  return (
    <div className="py-2 px-3 bg-black text-gray-100">
      <div className="w-full mx-auto relative">
        <div className="flex items-center">
          <div className="mr-3">
            <img src={logo} alt="logo" className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Ultimate Music Guide</h1>
            <h3 className="text-sm">by Bodzify</h3>
          </div>
        </div>
        <div className="search w-64 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SearchForm />
        </div>
      </div>
    </div>
  );
}

Banner.propTypes = {
  setSearchSubmitted: PropTypes.func.isRequired,
};

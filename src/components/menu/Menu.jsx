import { LuLibrary } from "react-icons/lu";
import { PiGraphLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";

import Page from "../../models/Page";
import { PAGE_TYPES } from "../../utils/constants";
import { usePage } from "../../contexts/page/usePage";

export default function Menu() {
  const { page, setPage } = usePage();

  const handleLibraryClick = () => {
    setPage(new Page(PAGE_TYPES.LIBRARY, null));
  };

  const handleGenrePlaylistsClick = () => {
    setPage(new Page(PAGE_TYPES.GENRE_PLAYLISTS, null));
  };

  return (
    <div className="menu-container bg-black flex-col justify-center items-start pt-3 px-1">
      <div className="menu-item-container" onClick={handleGenrePlaylistsClick}>
        <div
          className={
            page.type === PAGE_TYPES.GENRE_PLAYLISTS ? "menu-item-icon-container-active" : "menu-item-icon-container"
          }
        >
          <PiGraphLight />
        </div>
      </div>
      <div className="menu-item-container" onClick={handleLibraryClick}>
        <div
          className={page.type === PAGE_TYPES.LIBRARY ? "menu-item-icon-container-active" : "menu-item-icon-container"}
        >
          <LuLibrary />
        </div>
      </div>
      <div className="menu-item-container">
        <div className="menu-item-icon-container">
          <CiUser className="menu-item-icon" />
        </div>
      </div>
    </div>
  );
}

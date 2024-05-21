import { LuLibrary } from "react-icons/lu";
import { PiGraphLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";

import Page from "../../models/Page";
import { PAGE_TYPES } from "../../constants";
import { usePage } from "../../contexts/page/usePage";

export default function Menu() {
  const { setPage } = usePage();

  const handleLibraryClick = () => {
    setPage(new Page(PAGE_TYPES.LIBRARY, null));
  };

  const handleGenrePlaylistsClick = () => {
    setPage(new Page(PAGE_TYPES.GENRE_PLAYLISTS, null));
  };

  return (
    <div className="menu-container bg-black flex-col justify-center items-start px-1">
      <PiGraphLight className="menu-item" onClick={handleGenrePlaylistsClick} />
      <LuLibrary className="menu-item mt-1" onClick={handleLibraryClick} />
      <CiUser className="menu-item mt-1" />
    </div>
  );
}

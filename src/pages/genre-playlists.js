import { useEffect } from "react";
import { useNextPage } from "@contexts/NextPageContext";
import { PAGE_TYPES } from "@utils/constants";
import GenresPlaylists from "@components/page-container/pages/genre-playlists/GenrePlaylists";
import Page from "@models/Page";

export default function GenrePlaylistsPage() {
  const { setPage } = useNextPage();

  // Update page context when this page is rendered
  useEffect(() => {
    setPage(new Page(PAGE_TYPES.GENRE_PLAYLISTS));
  }, [setPage]);

  return (
    <div className="page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0">
      <GenresPlaylists />
    </div>
  );
}
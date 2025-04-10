import { useEffect } from "react";
import { useNextPage } from "@contexts/NextPageContext";
import { PAGE_TYPES } from "@utils/constants";
import SpotifyLibrary from "@/app/spotify-library/page";
import Page from "@models/Page";

export default function SpotifyLibraryPage() {
  const { setPage } = useNextPage();

  // Update page context when this page is rendered
  useEffect(() => {
    setPage(new Page(PAGE_TYPES.SPOTIFY_LIBRARY));
  }, [setPage]);

  return (
    <div className="page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0">
      <SpotifyLibrary />
    </div>
  );
}

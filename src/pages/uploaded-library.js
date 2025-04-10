import { useEffect } from "react";
import { useNextPage } from "@contexts/NextPageContext";
import { PAGE_TYPES } from "@utils/constants";
import UploadedLibrary from "@/app/uploaded-library/page";
import Page from "@models/Page";

export default function UploadedLibraryPage() {
  const { setPage } = useNextPage();

  // Update page context when this page is rendered
  useEffect(() => {
    setPage(new Page(PAGE_TYPES.UPLOADED_LIBRARY));
  }, [setPage]);

  return (
    <div className="page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0">
      <UploadedLibrary />
    </div>
  );
}

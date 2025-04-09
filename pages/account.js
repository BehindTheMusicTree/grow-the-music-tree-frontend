import { useEffect } from "react";
import { useNextPage } from "@contexts/NextPageContext";
import { PAGE_TYPES } from "@utils/constants";
import AccountPage from "@components/page-container/pages/AccountPage";
import Page from "@models/Page";

export default function Account() {
  const { setPage } = useNextPage();

  // Update page context when this page is rendered
  useEffect(() => {
    setPage(new Page(PAGE_TYPES.ACCOUNT));
  }, [setPage]);

  return (
    <div className="page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0">
      <AccountPage />
    </div>
  );
}
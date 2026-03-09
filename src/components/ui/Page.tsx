import { ReactNode } from "react";

interface PageProps {
  title: string;
  children: ReactNode;
  /** Route or feature id for E2E/analytics (e.g. "metadata-manager"). See docs/DATA_ATTRIBUTES.md. */
  dataPage: string;
}

export default function Page({ title, children, dataPage }: PageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" data-page={dataPage}>
      <header className="flex-none">
        <h1 className="page-title">{title}</h1>
      </header>
      <div className="page-content min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

import { ReactNode } from "react";

interface PageProps {
  title: string;
  /** Keep the h1 in the a11y tree without reserving visible header space (e.g. when the title would be redundant with existing on-page chrome). */
  visuallyHiddenTitle?: boolean;
  children: ReactNode;
  /** Route or feature id for E2E/analytics (e.g. "reference-genre-tree"). See docs/DATA_ATTRIBUTES.md. */
  dataPage: string;
}

export default function Page({ title, visuallyHiddenTitle = false, children, dataPage }: PageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" data-page={dataPage}>
      {visuallyHiddenTitle ? (
        <h1 className="sr-only">{title}</h1>
      ) : (
        <header className="flex-none">
          <h1 className="page-title">{title}</h1>
        </header>
      )}
      <div className="page-content min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

import { ReactNode } from "react";

interface PageProps {
  title: string;
  children: ReactNode;
}

export default function Page({ title, children }: PageProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="page-title flex-none">{title}</h1>
      <div className="page-content min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

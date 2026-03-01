import { ReactNode } from "react";

interface PageProps {
  title: string;
  children: ReactNode;
}

export default function Page({ title, children }: PageProps) {
  return (
    <>
      <h1>{title}</h1>
      <div>{children}</div>
    </>
  );
}

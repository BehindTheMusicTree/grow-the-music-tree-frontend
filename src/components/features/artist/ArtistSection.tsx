import { ReactNode, useId } from "react";

export default function ArtistSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="border-b border-gray-200 pb-1 text-lg font-semibold text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

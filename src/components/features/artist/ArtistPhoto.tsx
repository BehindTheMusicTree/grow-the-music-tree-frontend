import type { ReactNode } from "react";
import Image from "next/image";
import type { ArtistImage } from "@schemas/api/artist";

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
      {children}
    </a>
  );
}

export default function ArtistPhoto({ image, name }: { image: ArtistImage; name: string }) {
  return (
    <figure className="flex flex-col gap-1.5 px-6 py-2.5">
      <div className="relative h-64 w-full bg-[var(--color-surface-muted)] rounded">
        <Image src={image.url} alt={name} fill className="object-contain" />
      </div>
      <figcaption className="text-xs text-[var(--color-text-muted)]">
        Photo: <ExternalLink href={image.pageUrl}>{image.author ?? "Wikimedia Commons"}</ExternalLink>,{" "}
        {image.licenseUrl ? <ExternalLink href={image.licenseUrl}>{image.license}</ExternalLink> : image.license}
      </figcaption>
    </figure>
  );
}

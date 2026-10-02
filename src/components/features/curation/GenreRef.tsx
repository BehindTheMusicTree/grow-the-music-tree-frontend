import Link from "next/link";

type Props = { id: string; label?: string; showQid: boolean };

export function curationGenreHref(itemId: string) {
  return `/admin/curation/genre/${encodeURIComponent(itemId)}`;
}

export default function GenreRef({ id, label, showQid }: Props) {
  if (!label)
    return (
      <Link href={curationGenreHref(id)} className="font-mono text-sm underline">
        {id}
      </Link>
    );
  return (
    <Link href={curationGenreHref(id)} className="flex flex-col underline" title={showQid ? undefined : id}>
      <span>{label}</span>
      {showQid && <span className="font-mono text-xs text-gray-500">{id}</span>}
    </Link>
  );
}

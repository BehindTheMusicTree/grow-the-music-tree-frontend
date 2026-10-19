import Link from "next/link";
import GenreRef from "@components/features/curation/GenreRef";
import type { CurationReviewItem, CurationReviewReason } from "@schemas/api/curation";

const REASON_LABELS: Record<CurationReviewReason, string> = {
  redirect_conflict: "Fusion en conflit",
  missing: "Supprimé sur Wikidata",
  not_in_tree: "Hors de l'arbre",
};

export default function CurationReviewList({ items }: { items: CurationReviewItem[] }) {
  return (
    <table className="text-left">
      <thead>
        <tr>
          <th className="pr-4">Liste</th>
          <th className="pr-4">QID</th>
          <th className="pr-4">Raison</th>
          <th>Cible</th>
        </tr>
      </thead>
      <tbody>
        {items.map(({ list, key, column, itemId, reason, target }) => (
          <tr key={`${list}|${key}|${column}`}>
            <td className="pr-4">
              <Link href={`/admin/curation/${encodeURIComponent(list)}`} className="underline">
                {list}
              </Link>
            </td>
            <td className="pr-4">
              <GenreRef id={itemId} showQid={false} />
            </td>
            <td className="pr-4">{REASON_LABELS[reason]}</td>
            <td>{target && <GenreRef id={target} showQid={false} />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

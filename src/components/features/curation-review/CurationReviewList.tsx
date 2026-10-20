import Link from "next/link";
import GenreRef from "@components/features/curation/GenreRef";
import { curationColumnTitle } from "@lib/curationColumns";
import { curationListTitle } from "@lib/curationGroups";
import type { CurationReviewEvidence, CurationReviewItem, CurationReviewReason } from "@schemas/api/curation";

const REASON_LABELS: Record<CurationReviewReason, string> = {
  redirect_conflict: "Fusion en conflit",
  missing: "Supprimé sur Wikidata",
  not_in_tree: "Hors de l'arbre",
};

const FALLBACK_EXPLANATIONS: Record<CurationReviewReason, string> = {
  redirect_conflict: "L'élément a été fusionné sur Wikidata vers un élément déjà présent dans la liste.",
  missing: "L'élément n'existe plus sur Wikidata.",
  not_in_tree: "L'élément ne répond plus au critère d'appartenance à l'arbre.",
};

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeZone: "Europe/Paris" });

const WIKIDATA_URL = "https://www.wikidata.org/wiki/";

function joinLabels(items: NonNullable<CurationReviewEvidence["instanceOf"]>) {
  return items.map(({ id, label }) => `« ${label ?? id} »`).join(", ");
}

const MUSIC_GENRE_QID = "Q188451";

function explain({
  key,
  column,
  reason,
  target,
  evidence,
}: Pick<CurationReviewItem, "key" | "column" | "reason" | "target" | "evidence">) {
  if (reason === "redirect_conflict" && column !== "item_id" && target === key)
    return "Fusionné vers l'élément porteur de la règle lui-même (règle auto-référente).";
  if (!evidence) return FALLBACK_EXPLANATIONS[reason];
  const { modified, instanceOf, subclassOf, hasIndigenousTo, conflictList } = evidence;
  if (reason === "missing") return FALLBACK_EXPLANATIONS.missing;
  if (reason === "redirect_conflict") {
    return conflictList
      ? `Fusionné vers un élément déjà présent dans la liste ${curationListTitle(conflictList)}.`
      : FALLBACK_EXPLANATIONS.redirect_conflict;
  }
  const redirected = Boolean(target);
  const lead = redirected ? `Fusionné vers « ${evidence.label ?? target} », qui ` : "";
  if (hasIndigenousTo !== false && instanceOf?.some(({ id }) => id === MUSIC_GENRE_QID))
    return `${lead}${redirected ? "est toujours" : "Toujours"} un genre musical sur Wikidata : absent de l'arbre lors du dernier run (modification récente ou rang de déclaration)`;
  const lost =
    hasIndigenousTo === false
      ? redirected
        ? "n'a plus d'« indigène de » (P2341)"
        : "Plus d'« indigène de » (P2341)"
      : redirected
        ? "n'est plus une instance de « genre musical »"
        : "Plus une instance de « genre musical »";
  const sentences = [`${lead}${lost}`];
  if (modified)
    sentences[0] += ` (${redirected ? "cible modifiée" : "modifié"} le ${DATE_FORMAT.format(new Date(modified))})`;
  sentences[0] += ".";
  const now = [
    instanceOf?.length && `instance de ${joinLabels(instanceOf)}`,
    subclassOf?.length && `sous-classe de ${joinLabels(subclassOf)}`,
  ].filter(Boolean);
  if (now.length) sentences.push(`Aujourd'hui : ${now.join(", ")}.`);
  return sentences.join(" ");
}

function Rule({ rowKey, column }: { rowKey: string; column: string }) {
  const owner = <GenreRef id={rowKey} showQid={false} />;
  if (column === "parent_item_id" || column === "parent_id")
    return <span className="flex gap-1">Parent principal de {owner}</span>;
  if (column === "overview_item_id") return <span className="flex gap-1">Vue d&apos;ensemble de {owner}</span>;
  return (
    <span className="flex gap-1">
      {curationColumnTitle(column)} de {owner}
    </span>
  );
}

export default function CurationReviewList({ items }: { items: CurationReviewItem[] }) {
  return (
    <table className="text-left">
      <thead>
        <tr>
          <th className="pr-4">Liste</th>
          <th className="pr-4">QID</th>
          <th className="pr-4">Raison</th>
          <th className="pr-4">Règle</th>
          <th>Cible</th>
        </tr>
      </thead>
      <tbody>
        {items.map(({ list, key, column, itemId, reason, target, evidence }) => (
          <tr key={`${list}|${key}|${column}`}>
            <td className="pr-4">
              <Link href={`/admin/curation/${encodeURIComponent(list)}`} className="underline">
                {list}
              </Link>
            </td>
            <td className="pr-4">
              <GenreRef id={itemId} label={target ? undefined : evidence?.label} showQid={false} />
              <span className="flex gap-2 text-xs">
                <a
                  href={`${WIKIDATA_URL}${itemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${itemId} sur Wikidata`}
                  className="underline"
                >
                  Wikidata
                </a>
                <a
                  href={`${WIKIDATA_URL}${itemId}?action=history`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Historique de ${itemId} sur Wikidata`}
                  className="underline"
                >
                  Historique
                </a>
              </span>
            </td>
            <td className="pr-4">
              <p>{REASON_LABELS[reason]}</p>
              <p className="text-sm text-gray-600">{explain({ key, column, reason, target, evidence })}</p>
            </td>
            <td className="pr-4">{column !== "item_id" && <Rule rowKey={key} column={column} />}</td>
            <td>{target && <GenreRef id={target} label={evidence?.label} showQid={false} />}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

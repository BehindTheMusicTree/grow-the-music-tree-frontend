import Link from "next/link";
import GenreRef from "@components/features/curation/GenreRef";
import { curationColumnTitle } from "@lib/curationColumns";
import { curationListTitle } from "@lib/curationGroups";
import type { CurationReviewEvidence, CurationReviewItem, CurationReviewReason } from "@schemas/api/curation";

const REASON_LABELS: Record<CurationReviewReason, string> = {
  redirect_conflict: "Fusion en conflit",
  missing: "Supprimé sur Wikidata",
  not_in_tree: "Hors de l'arbre",
  invalid_rule: "Règle invalide",
  exclusive_parent_regional: "Exclusion impossible",
  unreached_genre: "Genre non rattaché",
  synthetic_overview_superseded: "Vue d’ensemble remplacée",
  synthetic_overview_orphaned: "Vue d’ensemble sans genre",
  synthetic_overview_renamed: "Vue d’ensemble renommée",
  alias_target_missing: "Cible introuvable",
  alias_target_ineligible: "Cible hors du catalogue",
  alias_source_auto_resolved: "Tag résolu automatiquement",
  alias_legacy_unmigrated: "Alias à migrer",
};

const FALLBACK_EXPLANATIONS: Record<CurationReviewReason, string> = {
  unreached_genre: "Le genre doit être rattaché à l’arbre.",
  synthetic_overview_superseded: "Une autre vue d’ensemble couvre cette région.",
  synthetic_overview_orphaned: "Aucun genre n’est rattaché à cette région.",
  synthetic_overview_renamed: "La vue d’ensemble utilise encore son ancien nom.",
  alias_target_missing: "L’identifiant enregistré est absent des données du pipeline.",
  alias_target_ineligible: "La cible ne peut plus recevoir ce tag.",
  alias_source_auto_resolved: "Le tag MusicBrainz correspond automatiquement à un genre. L’alias peut encore servir pour des variantes du tag.",
  alias_legacy_unmigrated: "Sélectionnez un identifiant pour remplacer le libellé historique.",
  redirect_conflict: "L'élément a été fusionné sur Wikidata vers un élément déjà présent dans la liste.",
  missing: "L'élément n'existe plus sur Wikidata.",
  not_in_tree: "L'élément ne répond plus au critère d'appartenance à l'arbre.",
  invalid_rule: "La règle contredit Wikidata : le pipeline l'a ignorée.",
  exclusive_parent_regional:
    "L'élément reste régional malgré l'exclusion des autres parents : à déplacer dans « Genres maintenus canoniques ».",
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
  if (reason.startsWith("alias_") || reason === "unreached_genre" || reason.startsWith("synthetic_overview_"))
    return FALLBACK_EXPLANATIONS[reason];
  if (reason === "redirect_conflict" && column !== "item_id" && target === key)
    return "Fusionné vers l'élément porteur de la règle lui-même (règle auto-référente).";
  if (!evidence) return FALLBACK_EXPLANATIONS[reason];
  const { modified, instanceOf, subclassOf, hasIndigenousTo, conflictList, detail } = evidence;
  if (reason === "invalid_rule") return detail ?? FALLBACK_EXPLANATIONS.invalid_rule;
  if (reason === "exclusive_parent_regional") return FALLBACK_EXPLANATIONS.exclusive_parent_regional;
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
    return <span className="flex gap-1">Parent de {owner}</span>;
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
        {items.map(({ ruleId, list, key, column, itemId, reason, target, evidence }) => {
          if (reason.startsWith("alias_")) {
            const exposure = evidence?.exposure;
            const query = new URLSearchParams({ q: key ?? "" });
            if (evidence?.entryUuid) query.set("edit", evidence.entryUuid);
            return (
              <tr key={`${ruleId ?? list}|${key ?? itemId}|${column}`}>
                <td className="pr-4">
                  <Link href={`/admin/curation/genre_alias?${query}`} aria-label={`Modifier l’alias ${key ?? ""}`} className="underline">
                    Modifier l’alias
                  </Link>
                </td>
                <td className="pr-4">{itemId || "—"}</td>
                <td className="pr-4">
                  <p>{REASON_LABELS[reason]}</p>
                  {exposure && (
                    <p className="text-body text-gray-600">
                      {exposure.any} chansons exposées ({exposure.recording} enregistrement, {exposure.releaseGroup} groupe
                      de sorties, {exposure.artist} artiste)
                    </p>
                  )}
                </td>
                <td className="pr-4">{key}</td>
                <td>
                  {evidence?.label}
                  {evidence?.alias?.currentLabel && evidence.alias.currentLabel !== evidence.label && (
                    <p className="text-caption">Libellé actuel {evidence.alias.currentLabel}</p>
                  )}
                  {evidence?.alias?.candidateItemIds?.length ? (
                    <p className="text-caption">{evidence.alias.candidateItemIds.join(", ")}</p>
                  ) : null}
                  {evidence?.alias?.automaticItemId && (
                    <p className="text-caption">Correspondance automatique {evidence.alias.automaticItemId}</p>
                  )}
                </td>
              </tr>
            );
          }

          return (
            <tr key={`${ruleId ?? list}|${key ?? itemId}|${column}`}>
              <td className="pr-4">
                <Link
                  href={
                    ruleId
                      ? `/admin/curation/genre/${encodeURIComponent(key?.split("\t")[0] ?? itemId)}`
                      : `/admin/curation/${encodeURIComponent(list ?? "synthetic_overview_resolutions")}`
                  }
                  className="underline"
                >
                  {list ?? "Vues d’ensemble régionales"}
                </Link>
              </td>
              <td className="pr-4">
                <GenreRef id={itemId} label={target ? undefined : evidence?.label ?? undefined} showQid={false} />
                {itemId.startsWith("Q") && <span className="flex gap-2 text-caption">
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
                </span>}
              </td>
              <td className="pr-4">
                <p>{REASON_LABELS[reason]}</p>
                <p className="text-body text-gray-600">{explain({ key, column, reason, target, evidence })}</p>
              </td>
              <td className="pr-4">{key && column !== "item_id" && <Rule rowKey={key} column={column} />}</td>
              <td>{target && <GenreRef id={target} label={evidence?.label ?? undefined} showQid={false} />}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

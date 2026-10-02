export const CURATION_GROUPS: { title: string; lists: Record<string, string> }[] = [
  {
    title: "Racines",
    lists: {
      accepted_canonical_roots: "Racines canoniques acceptées",
      umbrella_canonical_genres: "Genres « parapluie » canoniques",
      canonical_genre_pop_side: "Côté pop des racines",
    },
  },
  {
    title: "Parenté",
    lists: {
      main_parent: "Parent principal imposé",
      canonical_parent_additions: "Parents canoniques ajoutés",
      overview_reclassifications: "Genres reclassés en vue régionale",
      regional_secondary_parents: "Parents régionaux secondaires",
    },
  },
  {
    title: "Exclusions",
    lists: {
      theme_genres: "Thèmes (pas des genres)",
      technique_genres: "Techniques (pas des genres)",
      out_of_scope_genres: "Hors sujet",
      duplicate_genres: "Doublons",
      indigenous_to_exclusions: "« Originaire de » ignoré",
    },
  },
  {
    title: "Libellés",
    lists: {
      label_overrides: "Libellés imposés",
      capitalized_words: "Mots gardés en majuscule",
    },
  },
  {
    title: "Régional",
    lists: {
      regional_overrides: "Rattachements régionaux",
      regional_overview_additions: "Vues régionales ajoutées",
    },
  },
  {
    title: "Matching des chansons",
    lists: {
      genre_alias: "Alias de genres MusicBrainz",
      accepted_non_genre_tags: "Tags MusicBrainz ignorés",
    },
  },
];

export const UNGROUPED_TITLE = "Non classées";

export function curationListTitle(name: string): string {
  return CURATION_GROUPS.find((group) => name in group.lists)?.lists[name] ?? name;
}

/** Lists the registry has but no group maps land in a trailing UNGROUPED_TITLE group, never hidden. */
export function groupCurationLists<T extends { name: string }>(lists: T[]): { title: string; lists: T[] }[] {
  const byName = new Map(lists.map((list) => [list.name, list]));
  const groups = CURATION_GROUPS.map((group) => ({
    title: group.title,
    lists: Object.keys(group.lists).flatMap((name) => byName.get(name) ?? []),
  }));
  const grouped = new Set(CURATION_GROUPS.flatMap((group) => Object.keys(group.lists)));
  const ungrouped = lists.filter((list) => !grouped.has(list.name));
  return [...groups, { title: UNGROUPED_TITLE, lists: ungrouped }].filter((group) => group.lists.length > 0);
}

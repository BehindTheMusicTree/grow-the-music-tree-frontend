import { describe, it, expect } from "vitest";
import { CURATION_GROUPS, UNGROUPED_TITLE, curationListTitle, groupCurationLists } from "@lib/curationGroups";

// Mirrors grow-api's CURATION_LISTS registry (grow/curation/lists.py).
const REGISTRY = [
  "accepted_canonical_roots",
  "canonical_parent_additions",
  "capitalized_words",
  "duplicate_genres",
  "indigenous_to_exclusions",
  "label_overrides",
  "main_parent",
  "out_of_scope_genres",
  "overview_reclassifications",
  "regional_overrides",
  "regional_overview_additions",
  "technique_genres",
  "theme_genres",
  "umbrella_canonical_genres",
  "accepted_non_genre_tags",
  "canonical_genre_pop_side",
  "genre_alias",
  "regional_secondary_parents",
];

describe("curationGroups", () => {
  it("maps every registry list exactly once", () => {
    const mapped = CURATION_GROUPS.flatMap((group) => Object.keys(group.lists));
    expect(mapped.toSorted()).toEqual(REGISTRY.toSorted());
  });

  it("puts unmapped lists in a trailing ungrouped group and drops empty groups", () => {
    const groups = groupCurationLists([{ name: "genre_alias" }, { name: "brand_new" }]);
    expect(groups).toEqual([
      { title: "Matching des chansons", lists: [{ name: "genre_alias" }] },
      { title: UNGROUPED_TITLE, lists: [{ name: "brand_new" }] },
    ]);
  });

  it("falls back to the technical name for an unmapped list title", () => {
    expect(curationListTitle("main_parent")).toBe("Parent principal imposé");
    expect(curationListTitle("brand_new")).toBe("brand_new");
  });
});

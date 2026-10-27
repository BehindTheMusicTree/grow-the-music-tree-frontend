import { describe, it, expect } from "vitest";
import fixture from "./genealogy.fixture.json";
import { GenealogySchema } from "./genealogy";

describe("GenealogySchema", () => {
  it("parses a Gold 4_genealogy.json sample", () => {
    const result = GenealogySchema.safeParse(fixture);

    expect(result.success).toBe(true);
    expect(result.data?.traditions.some((tradition) => tradition.anchorId === null)).toBe(true);
  });

  it("rejects unknown keys wherever the Gold schema forbids additional properties", () => {
    expect(GenealogySchema.safeParse({ ...fixture, extra: 1 }).success).toBe(false);
    expect(
      GenealogySchema.safeParse({ ...fixture, traditions: [{ ...fixture.traditions[0], extra: 1 }] }).success,
    ).toBe(false);
    expect(
      GenealogySchema.safeParse({
        ...fixture,
        columns: [{ ...fixture.columns[0], lanes: [{ ...fixture.columns[0]!.lanes[0], extra: 1 }] }],
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed tradition id, an unknown link kind and an empty lane list", () => {
    expect(
      GenealogySchema.safeParse({ ...fixture, traditions: [{ ...fixture.traditions[0], wikidataId: "LOCAL:x" }] }).success,
    ).toBe(false);
    expect(
      GenealogySchema.safeParse({ ...fixture, traditionLinks: [{ ...fixture.traditionLinks[0], kind: "other" }] }).success,
    ).toBe(false);
    expect(GenealogySchema.safeParse({ ...fixture, columns: [{ ...fixture.columns[0], lanes: [] }] }).success).toBe(false);
  });
});

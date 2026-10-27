import { describe, it, expect } from "vitest";
import { buildCurationRowSchema, toCurationRow } from "./curation";

const list = {
  name: "main_parent",
  keyColumns: ["item_id"],
  columns: ["item_id", "reason", "exclude_other_parents"],
  columnSpecs: [
    { name: "item_id", kind: "item_id" as const, optional: false },
    { name: "reason", kind: "text" as const, optional: false },
    { name: "exclude_other_parents", kind: "bool" as const, optional: false },
  ],
  description: "",
  count: 0,
};

describe("buildCurationRowSchema", () => {
  const schema = buildCurationRowSchema(list);

  it.each(["Q1", "LOCAL:afro-pop"])("accepts item id %s", (itemId) => {
    expect(schema.safeParse({ item_id: itemId, reason: "r", exclude_other_parents: "" }).success).toBe(true);
  });

  it("rejects a malformed item id, a blank column and a non-boolean flag", () => {
    const result = schema.safeParse({ item_id: "X1", reason: " ", exclude_other_parents: "yes" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual([
      "item_id",
      "reason",
      "exclude_other_parents",
    ]);
  });

  it("takes a row with only ids and a reason, since names are resolved rather than typed", () => {
    expect(schema.safeParse({ item_id: "Q1", reason: "r", exclude_other_parents: "" }).success).toBe(true);
  });

  it("lets an optional column stay blank but still checks it when filled", () => {
    const optionalList = {
      ...list,
      columns: ["item_id", "genre_item_id"],
      columnSpecs: [
        { name: "item_id", kind: "item_id" as const, optional: false },
        { name: "genre_item_id", kind: "item_id" as const, optional: true },
      ],
    };
    const optionalSchema = buildCurationRowSchema(optionalList);

    expect(optionalSchema.safeParse({ item_id: "Q1", genre_item_id: "" }).success).toBe(true);
    expect(optionalSchema.safeParse({ item_id: "Q1", genre_item_id: "Q2" }).success).toBe(true);
    expect(optionalSchema.safeParse({ item_id: "Q1", genre_item_id: "nope" }).success).toBe(false);
  });

  it("rejects a tab in a key column", () => {
    const result = schema.safeParse({ item_id: "Q1", reason: "a\tb", exclude_other_parents: "" });
    expect(result.success).toBe(true);
    expect(
      buildCurationRowSchema({ ...list, keyColumns: ["reason"] }).safeParse({
        item_id: "Q1",
        reason: "a\tb",
        exclude_other_parents: "",
      }).success,
    ).toBe(false);
  });
});

describe("buildCurationRowSchema kinds", () => {
  const kindSchema = (kind: "tradition_id" | "entity_id" | "int", optional = false) =>
    buildCurationRowSchema({
      ...list,
      keyColumns: [],
      columns: ["value"],
      columnSpecs: [{ name: "value", kind, optional }],
    });

  it.each([
    ["tradition_id", "Q123", true],
    ["tradition_id", "LOCAL:blues", false],
    ["tradition_id", "abcd1234", false],
    ["entity_id", "abcd1234", true],
    ["entity_id", "Q42", true],
    ["entity_id", "abc1234", false],
    ["entity_id", "LOCAL:blues", false],
    ["int", "1950", true],
    ["int", "-300", true],
    ["int", "19.5", false],
    ["int", "abc", false],
  ] as const)("%s accepts %s: %s", (kind, value, accepted) => {
    expect(kindSchema(kind).safeParse({ value }).success).toBe(accepted);
  });

  it("lets an optional int stay blank but checks it when filled", () => {
    const schema = kindSchema("int", true);

    expect(schema.safeParse({ value: "" }).success).toBe(true);
    expect(schema.safeParse({ value: "-12" }).success).toBe(true);
    expect(schema.safeParse({ value: "x" }).success).toBe(false);
  });

  it("requires a non-optional int", () => {
    expect(kindSchema("int").safeParse({ value: "" }).success).toBe(false);
  });
});

describe("toCurationRow", () => {
  it('maps booleans to "true"/"" and fills missing columns', () => {
    expect(toCurationRow(list, { item_id: "Q1", exclude_other_parents: false })).toEqual({
      item_id: "Q1",
      reason: "",
      exclude_other_parents: "",
    });
  });
});

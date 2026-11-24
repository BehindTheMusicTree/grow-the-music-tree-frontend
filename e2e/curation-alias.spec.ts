import { createServer } from "node:http";
import { expect, test } from "@playwright/test";
import { encode } from "next-auth/jwt";
import {
  AliasTargetSearchSchema,
  CurationEntriesPageSchema,
  CurationEntrySchema,
  CurationListsSchema,
  CurationReviewItemsSchema,
  CurationStatusSchema,
} from "@schemas/api/curation";
import { adminApiOrigin, adminApiPort, authSecret } from "./support/admin-config";

const uuid = "00000000-0000-4000-8000-000000000001";
const tag = "regional mexicano";
const previousLabel = "regional Mexican";
const target = { id: "Q7309098", label: "regional Mexican music", tree: "regional" };
const exportedOn = "2026-11-24T12:00:00Z";
const idToken = "e2e-admin-id-token";
const entryPath = `/v1/curation/genre_alias/entries/${uuid}/`;

const entry = CurationEntrySchema.parse({
  uuid,
  row: { musicbrainz_genre_name: tag, wikidata_genre_name: previousLabel, target_item_id: "", reason: "Curated" },
  createdOn: exportedOn,
  updatedOn: null,
});
const list = CurationListsSchema.parse([{
  name: "genre_alias",
  keyColumns: ["musicbrainz_genre_name"],
  columns: Object.keys(entry.row),
  columnSpecs: [
    { name: "musicbrainz_genre_name", kind: "text", optional: false },
    { name: "wikidata_genre_name", kind: "text", optional: false },
    { name: "target_item_id", kind: "item_id", optional: true },
    { name: "reason", kind: "text", optional: true },
  ],
  description: "MusicBrainz aliases",
  count: 1,
}]);

test("repairs the alias selected in the admin review queue by its UUID", async ({ context, page }) => {
  const writes: unknown[] = [];
  const reading = new Map<string, unknown>([
    ["/v1/curation/review/?genre_alias_version=2", CurationReviewItemsSchema.parse([{
      ruleId: null, list: "genre_alias", key: tag, column: "target_item_id", itemId: "",
      reason: "alias_legacy_unmigrated", target: null, reportedOn: exportedOn,
      evidence: { entryUuid: uuid, label: previousLabel },
    }])],
    ["/v1/curation/lists/", list],
    ["/v1/curation/status/", CurationStatusSchema.parse({ appliedExportOn: exportedOn, pendingCount: 0 })],
    ["/v1/curation/genre_alias/entries/", CurationEntriesPageSchema.parse({
      overallTotal: 0, page: 1, totalPages: 1, results: [], labels: {},
    })],
    [entryPath, entry],
    ["/v1/curation/genre-alias-targets/", AliasTargetSearchSchema.parse({ results: [target] })],
  ]);
  const upstream = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", adminApiOrigin);
    response.setHeader("Content-Type", "application/json");
    if (request.headers.authorization !== `Bearer ${idToken}`) {
      response.writeHead(401).end("{}");
      return;
    }
    if (request.method === "PATCH" && url.pathname === entryPath) {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(chunk);
      writes.push(JSON.parse(Buffer.concat(chunks).toString()));
      response.end(JSON.stringify({
        ...entry,
        row: { ...entry.row, wikidata_genre_name: target.label, target_item_id: target.id },
        updatedOn: exportedOn,
      }));
      return;
    }
    const lookup = url.pathname.endsWith("/review/") ? url.pathname + url.search : url.pathname;
    const payload = request.method === "GET" ? reading.get(lookup) : undefined;
    response.writeHead(payload === undefined ? 404 : 200).end(JSON.stringify(payload ?? {}));
  });
  await new Promise<void>((resolve, reject) => {
    upstream.once("error", reject);
    upstream.listen(adminApiPort, "127.0.0.1", resolve);
  });

  try {
    const name = "__Secure-authjs.session-token";
    const value = await encode({
      secret: authSecret,
      salt: name,
      token: { idToken, expiresAt: Math.floor(Date.now() / 1000) + 3600, upstream: `${adminApiOrigin}/v1/` },
    });
    await context.addCookies([{ name, value, domain: "localhost", path: "/", secure: true, httpOnly: true }]);

    await page.goto("/admin/curation-review");
    await page.getByRole("link", { name: `Modifier l’alias ${tag}` }).press("Enter");
    await expect(page).toHaveURL((url) =>
      url.pathname === "/admin/curation/genre_alias" &&
      url.searchParams.get("q") === tag &&
      url.searchParams.get("edit") === uuid,
    );
    const dialog = page.getByRole("dialog", { name: "Modifier l'entrée" });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await expect(dialog.getByRole("textbox", { name: "Genre MusicBrainz" })).toHaveValue(tag);

    const input = page.getByRole("combobox", { name: "Genre cible" });
    await expect(input).toHaveValue(previousLabel);
    await input.fill(target.id);
    const save = page.getByRole("button", { name: "Enregistrer" });
    await expect(save).toBeDisabled();
    await page.getByRole("option", { name: new RegExp(target.id) }).click();
    await expect(input).toHaveValue(target.label);
    await save.click();

    await expect(page).toHaveURL((url) =>
      url.pathname === "/admin/curation/genre_alias" &&
      url.searchParams.get("q") === tag &&
      !url.searchParams.has("edit"),
    );
    await expect(save).toHaveCount(0);
    expect(writes).toEqual([{
      row: { musicbrainz_genre_name: tag, target_item_id: target.id, reason: "Curated" },
    }]);
  } finally {
    await new Promise<void>((resolve, reject) => upstream.close((error) => error ? reject(error) : resolve()));
  }
});

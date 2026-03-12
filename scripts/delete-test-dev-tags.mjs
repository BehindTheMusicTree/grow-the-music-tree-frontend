#!/usr/bin/env node
/**
 * Deletes local and remote test and dev tags for the current version (e.g. v1.4.0-test, v1.4.0-dev-*).
 * Does not delete rc/beta/alpha tags. Reads version from package.json. Run as part of postversion.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = join(process.cwd());
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;
const tagPrefix = `v${version}-`;

const PRERELEASE_PREFIXES = ["test", "dev"];

function isTestOrDevTag(tag) {
  if (!tag.startsWith(tagPrefix)) return false;
  const suffix = tag.slice(tagPrefix.length);
  return PRERELEASE_PREFIXES.some((p) => suffix === p || suffix.startsWith(`${p}`));
}

function exec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", ...opts });
  } catch (e) {
    if (opts.ignoreExitCode) return "";
    throw e;
  }
}

const toDelete = [];
try {
  const out = exec("git ls-remote --tags origin");
  for (const line of out.trim().split("\n")) {
    const ref = line.split(/\s+/)[1];
    const tag = ref?.startsWith("refs/tags/") ? ref.slice("refs/tags/".length) : null;
    if (tag && isTestOrDevTag(tag)) toDelete.push(tag);
  }
} catch {
  console.warn("delete-test-dev-tags: could not list remote tags (skip remote cleanup)");
}

let localTags = "";
try {
  localTags = exec(`git tag -l "${tagPrefix}*"`);
} catch {
  localTags = "";
}
const localList = (localTags.trim() ? localTags.trim().split(/\s+/) : []).filter(isTestOrDevTag);

const all = [...new Set([...toDelete, ...localList])];
if (all.length === 0) {
  console.log(`No test/dev tags for v${version} to delete`);
  process.exit(0);
}

for (const tag of all) {
  try {
    execSync("git", ["push", "origin", "--delete", tag], { encoding: "utf8", stdio: "inherit" });
    console.log(`Deleted remote: ${tag}`);
  } catch {
    // already gone or no remote
  }
  try {
    execSync("git", ["tag", "-d", tag], { encoding: "utf8", stdio: "pipe" });
    console.log(`Deleted local: ${tag}`);
  } catch {
    // already gone
  }
}

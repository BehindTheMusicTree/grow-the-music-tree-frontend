#!/usr/bin/env node
/**
 * Moves [Unreleased] content into a new versioned section below it.
 * Reads version from package.json and date as today (YYYY-MM-DD).
 * Used by postversion to run after `npm version`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;
const date = new Date().toISOString().slice(0, 10);

const changelogPath = join(root, "CHANGELOG.md");
let content = readFileSync(changelogPath, "utf8");

const marker = "\n## [Unreleased]\n\n";
const first = content.indexOf(marker);
const second = content.indexOf(marker, first + 1);
if (second === -1) {
  console.error("update-changelog-release: could not find [Unreleased] section");
  process.exit(1);
}

const nextSection = content.indexOf("\n## [", second + marker.length);
if (nextSection === -1) {
  console.error("update-changelog-release: could not find next version section");
  process.exit(1);
}

const unreleasedContent = content.slice(second + marker.length, nextSection).trim();
const newBlock = `${marker.trim()}\n\n## [${version}] - ${date}\n\n${unreleasedContent}\n\n`;
const newContent = content.slice(0, second) + newBlock + content.slice(nextSection);

writeFileSync(changelogPath, newContent, "utf8");
console.log(`CHANGELOG: moved [Unreleased] to [${version}] - ${date}`);

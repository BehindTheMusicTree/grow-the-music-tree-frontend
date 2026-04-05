if (process.env.VERCEL !== "1") {
  process.exit(0);
}

const token = process.env.NPM_TOKEN?.trim();
if (token) {
  process.exit(0);
}

console.error(`
[vercel] Missing NPM_TOKEN: this app installs @behindthemusictree/* from GitHub Packages.

Fix: Vercel → Project → Settings → Environment Variables → add NPM_TOKEN (Sensitive).
Enable it for Production, Preview, and Development (each environment is separate).

Use a GitHub PAT with read:packages for the org that owns the package.

Docs: docs/DEPLOYMENT.md (section "GitHub Packages").
`);
process.exit(1);

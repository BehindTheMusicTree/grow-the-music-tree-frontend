# Versioning Strategy

The application uses semantic versions in `package.json`; see
[SEMVER_GUIDE.md](SEMVER_GUIDE.md) for choosing a version. A stable `vX.Y.Z` tag
on `main` records the commit associated with that version.

## Initial activation

Before the first automated release, the workflow and policy must reach `main` in a
separate PR with no version change, and the release App and tag protections must
be provisioned. The activation push intentionally creates no tag. If the first
version bump arrives in the same push as the policy, it will also create no tag.
Promoting this setup to `main` deploys production and requires separate authorization.

## Preparing a release

1. Create a `release/*` branch from `develop` (or a `hotfix/*` branch from `main`).
2. Update `package.json` with `npm pkg set version=X.Y.Z` and move the appropriate
   `[Unreleased]` entries into a dated `## [X.Y.Z] - YYYY-MM-DD` changelog section.
3. Open a PR to `main` and pass the required checks, including the production API
   compatibility check. Merge through GitHub.
4. Check the shared release workflow. It validates the version and changelog and
   creates the matching tag on the versioned `main` commit. Do not create, move,
   or delete tags manually.
5. Open the required `main` → `develop` back-merge PR.

The release workflow creates a tag only; it does not publish a package or create a
GitHub Release. Provision the release App and tag protections using the organization
release-automation procedure.

## Deployment

Coolify deploys production on pushes to `main` and staging on pushes to `develop`,
independently of tags; see [DEPLOYMENT.md](DEPLOYMENT.md). A tag does not trigger a
deployment. The optional `NEXT_PUBLIC_APP_VERSION` footer variable is not currently
passed into the Coolify build.

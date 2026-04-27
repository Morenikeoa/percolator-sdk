# STAGE III — package structure decision

## Choice: option (2) single repo, multi entry

`src/index.ts` exports the full surface (current behavior).
`src/vanilla.ts` exports the vanilla subset (deployed v12.17 line
encoders + types only). `package.json` `exports` field maps both
subpaths.

## Rationale

Option (1) monorepo workspaces was overkill for a single TypeScript
package with one shared dependency tree. The existing `src/` directory
is a flat module graph. Splitting into workspace packages would force
a build-tooling rewrite (tsup config, package.json resolution, jest
config) for no tangible benefit.

Option (3) two packages with `sdk-vanilla` depending on
`sdk-internal` was rejected because it doubles the npm publish
surface and forces a coupled-version dance every release. No
caller has asked for strict bundle separation.

Option (2) is additive: existing imports of `@percolatorct/sdk`
continue to work. A new caller who wants the vanilla-only surface
imports `@percolatorct/sdk/vanilla` and gets a tree-shakable subset
that omits PERC-628 shared vault, NFT instructions, dispute flows,
LP collateral, ADL, and any other v12.19-only or fork-extended path.

## Acceptance gate

Meta-test imports `@percolatorct/sdk/vanilla` and asserts that the
exported set equals the documented vanilla subset (no fork-extended
types leaking via re-export). Ships in PHASE β.

## Vanilla subset definition

See `vanilla-subset.md`. The 27 v12.17.7 reachable instructions per
the brief, plus the corresponding `IX_TAG` keys, encoder functions,
account specs, and minimal supporting types (`PublicKey`,
`Uint8Array`, `WrapperTarget` type alias for callers using v12.17
default).

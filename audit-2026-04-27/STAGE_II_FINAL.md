# STAGE II — final report

v12.19 forward-port + v12.20 prep. Cut 1.0.0-beta.39-presync on `sync/v12.19-sdk`.

## Verdict

GO. Branch ready for merge once PR #88 + #271 land.

## Branch policy decision

PHASE A recheck:
- PR #88 (engine, dcccrypto/percolator): OPEN, MERGEABLE, BLOCKED.
- PR #271 (wrapper, dcccrypto/percolator-prog): OPEN, MERGEABLE, CLEAN.

Per branch policy: cut on `sync/v12.19-sdk`, tag `beta.39-presync`,
do NOT push npm. Confirmed.

## Dual-target invariants

Backward compatibility preserved for v12.17 callers:
- `encodeUpdateConfig` default = v12.17 (33 bytes).
- `encodeInitMarket` default = v12.17 (344 bytes).
- PERC-628 encoders default to throw, matching beta.37 behavior.

v12.19 callers opt in via `target: 'v12.19'`.

## Tests added

| file | tests |
|:---|---:|
| test/parity/v12.19-encoder-bytes.parity.test.ts | 17 |

Total: 809 -> 826 PASS. 31 SKIPPED unchanged.

## Files changed

```
M README.md           supported wrapper versions section + version + test count
M CHANGELOG.md        beta.39-presync entry
M package.json        version bump
M src/abi/instructions.ts
                      WrapperTarget type
                      encodeUpdateConfig target='v12.19' branch
                      encodeInitMarket target='v12.19' branch
                      PERC-628 5 encoders un-throw under target='v12.19'
M vitest.config.ts    register v12.19 parity test
A test/parity/v12.19-encoder-bytes.parity.test.ts  17 byte-parity tests
A audit-2026-04-27/v12.19-diff.md         wire-format and layout diff
A audit-2026-04-27/v12.20-design-notes.md migration plan for c175ec4, f04720e, 5229c1c
A audit-2026-04-27/STAGE_II_FINAL.md      this file
```

## v12.20 design notes pointer

`audit-2026-04-27/v12.20-design-notes.md` covers the deferred upstream
commits and the SDK changes they will require. Resume checklist included.

## Layout-level v12.19 detection — deferred

The vault offset 600 -> 616 shift in v12.19 requires updating
`detectSlabLayout` (src/solana/slab.ts). Skipped this stage to keep the
encoder-side fix minimal and reviewable. Layout work scheduled for the
v12.20 sync release when wrapper-side tier sizes also stabilize. Current
SDK consumers reading MarketConfig fields are unaffected (those fields
are layout-stable across v12.17 -> v12.19).

## Gates green

- pnpm build: ESM build success in 18ms, dist 265.07 KB.
- pnpm lint: zero errors.
- pnpm test: 26 files, 826 PASS, 31 SKIPPED.

## Commit hashes / tag

```
<sha-stage-II> release: v1.0.0-beta.39-presync. v12.19 forward-port + v12.20 prep.
tag beta.39-presync
```

Branch: `sync/v12.19-sdk` (NOT pushed to remote per branch policy).

## Verdict

STAGE II COMPLETE. Proceeding to STAGE III.

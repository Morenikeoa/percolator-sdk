# @percolatorct/sdk/vanilla

Minimal encoder surface for the v12.17.7 deployed Percolator mainnet
line.

## When to use

Use the vanilla subpath when you target an unmodified Percolator
deployment and want to keep your bundle small. Tree-shakable, zero
fork-extended code reachable.

```ts
import {
  encodeInitMarket,
  encodeTradeCpi,
  ACCOUNTS_TRADE_CPI,
  buildAccountMetas,
} from "@percolatorct/sdk/vanilla";
```

The full SDK at `@percolatorct/sdk` re-exports the same vanilla
encoders plus everything fork-extended. Existing imports of the
default entry continue to work.

## What's in vanilla

27 instructions matching the v12.17.7 deployed reachability list. See
`audit-2026-04-27/vanilla-subset.md` for the authoritative table.

Categories:
- Market creation: `encodeInitMarket`, `encodeCloseSlab`,
  `encodeUpdateConfig`, `encodeSetOraclePriceCap`.
- User flow: `encodeInitUser`, `encodeDepositCollateral`,
  `encodeWithdrawCollateral`, `encodeCloseAccount`,
  `encodeReclaimEmptyAccount`, `encodeSettleAccount`,
  `encodeDepositFeeCredits`, `encodeConvertReleasedPnl`.
- LP flow: `encodeInitLP`.
- Trading: `encodeTradeNoCpi`, `encodeTradeCpi`.
- Liquidation: `encodeLiquidateAtOracle`, `encodeKeeperCrank`,
  `encodeForceCloseResolved`.
- Insurance: `encodeTopUpInsurance`, `encodeWithdrawInsurance`,
  `encodeWithdrawInsuranceLimited`.
- Admin: `encodeAdminForceClose`, `encodeUpdateAdmin`,
  `encodeAcceptAdmin`, `encodeUpdateAuthority`.
- Resolve: `encodeResolveMarket`, `encodeResolvePermissionless`.

Plus matching `ACCOUNTS_*` constants, `buildAccountMetas`, encoding
primitives (`encU8`, `encU16`, etc.), `IX_TAG`, `AUTHORITY_KIND`, and
the `WrapperTarget` type.

## What's NOT in vanilla

Anything fork-extended:
- LP vault (PERC-272), LP collateral (PERC-315).
- Auto-deleverage (PERC-305).
- Disputes (PERC-314).
- Position NFTs (PERC-608).
- Oracle phase (PERC-622).
- Shared vault (PERC-628).
- Wallet caps, OI imbalance (PERC-8110/8111).
- Orphan recovery, DEX pool pin (PERC-8270).
- Cross-margin offsets.
- Pause / unpause.
- Hyperp DEX EMA (`UpdateHyperpMark`).
- Slab recovery + audit.
- Insurance LP aliases.
- Matcher CPI initializer.

If you need any of those, import from `@percolatorct/sdk` directly.

## Bundle size

| entry | gzip-ish ESM size |
|:---|---:|
| `@percolatorct/sdk` | 265 KB |
| `@percolatorct/sdk/vanilla` | 28 KB |

(Sizes from `dist/index.js` and `dist/vanilla.js` raw, not gzipped.
Real gzipped reductions are larger.)

## Surface invariant

A meta-test at `test/vanilla.test.ts` enforces that the vanilla
subpath exports exactly the documented set. If you add a new
fork-extended encoder to the full SDK, the vanilla test catches any
accidental re-export. If you intentionally promote an instruction to
vanilla scope, update the meta-test's `EXPECTED_*` arrays plus
`audit-2026-04-27/vanilla-subset.md`.

## Versioning

The vanilla subpath follows the same SemVer as the parent package.
2.0.0-rc.0 introduces this subpath additively over 1.0.0-beta.39.

If you need to pin a vanilla-only version separately, file an issue
and we will consider splitting into two npm packages in a future
major version.

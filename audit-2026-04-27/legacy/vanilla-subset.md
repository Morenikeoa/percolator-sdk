# Vanilla subset

Authoritative source: deployed instruction list per the audit brief +
`exploit/session3/03_execution_log.md`. PushHyperpMark (tag 17) and
CatchupAccrue (tag 31) are excluded because they are NOT in the
post-merge wrapper at d760fc4.

## Instruction set (27 entries)

| tag | name | encoder | accounts |
|---:|:---|:---|:---|
| 0 | InitMarket | encodeInitMarket | ACCOUNTS_INIT_MARKET |
| 1 | InitUser | encodeInitUser | ACCOUNTS_INIT_USER |
| 2 | InitLP | encodeInitLP | ACCOUNTS_INIT_LP |
| 3 | DepositCollateral | encodeDepositCollateral | ACCOUNTS_DEPOSIT_COLLATERAL |
| 4 | WithdrawCollateral | encodeWithdrawCollateral | ACCOUNTS_WITHDRAW_COLLATERAL |
| 5 | KeeperCrank | encodeKeeperCrank | ACCOUNTS_KEEPER_CRANK |
| 6 | TradeNoCpi | encodeTradeNoCpi | ACCOUNTS_TRADE_NOCPI |
| 7 | LiquidateAtOracle | encodeLiquidateAtOracle | ACCOUNTS_LIQUIDATE_AT_ORACLE |
| 8 | CloseAccount | encodeCloseAccount | ACCOUNTS_CLOSE_ACCOUNT |
| 9 | TopUpInsurance | encodeTopUpInsurance | ACCOUNTS_TOPUP_INSURANCE |
| 10 | TradeCpi | encodeTradeCpi | ACCOUNTS_TRADE_CPI |
| 12 | UpdateAdmin | encodeUpdateAdmin | ACCOUNTS_UPDATE_ADMIN |
| 13 | CloseSlab | encodeCloseSlab | ACCOUNTS_CLOSE_SLAB |
| 14 | UpdateConfig | encodeUpdateConfig | ACCOUNTS_UPDATE_CONFIG |
| 18 | SetOraclePriceCap | encodeSetOraclePriceCap | ACCOUNTS_SET_ORACLE_PRICE_CAP |
| 19 | ResolveMarket | encodeResolveMarket | ACCOUNTS_RESOLVE_MARKET |
| 20 | WithdrawInsurance | encodeWithdrawInsurance | ACCOUNTS_WITHDRAW_INSURANCE |
| 21 | AdminForceClose | encodeAdminForceClose | ACCOUNTS_ADMIN_FORCE_CLOSE |
| 23 | WithdrawInsuranceLimited | encodeWithdrawInsuranceLimited | ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_LIVE / _RESOLVED |
| 25 | ReclaimEmptyAccount | encodeReclaimEmptyAccount | ACCOUNTS_RECLAIM_EMPTY_ACCOUNT |
| 26 | SettleAccount | encodeSettleAccount | ACCOUNTS_SETTLE_ACCOUNT |
| 27 | DepositFeeCredits | encodeDepositFeeCredits | ACCOUNTS_DEPOSIT_FEE_CREDITS |
| 28 | ConvertReleasedPnl | encodeConvertReleasedPnl | ACCOUNTS_CONVERT_RELEASED_PNL |
| 29 | ResolvePermissionless | encodeResolvePermissionless | ACCOUNTS_RESOLVE_PERMISSIONLESS |
| 30 | ForceCloseResolved | encodeForceCloseResolved | ACCOUNTS_FORCE_CLOSE_RESOLVED |
| 82 | AcceptAdmin | encodeAcceptAdmin | ACCOUNTS_ACCEPT_ADMIN |
| 83 | UpdateAuthority | encodeUpdateAuthority | ACCOUNTS_UPDATE_AUTHORITY |

## Excluded from vanilla (lives in full SDK only)

- PERC-272/PERC-309 LP vault tags 37-40, 47-49.
- PERC-305 ExecuteAdl tag 50.
- PERC-306/PERC-309 fund + cap tags 41, 79.
- PERC-314 dispute tags 43, 44, 80.
- PERC-315 LP collateral tags 45, 46, 81.
- PERC-608 NFT tags 64-69.
- PERC-622 oracle phase tag 56.
- PERC-628 shared vault tags 59-63.
- PERC-8110/8111 caps tags 70, 71, 78.
- PERC-8270/SetDexPool tags 72-74.
- Cross-margin tags 54, 55.
- Slab recovery + audit tags 51-53.
- Pause/unpause tags 76, 77.
- Hyperp DEX EMA tag 34 (UpdateHyperpMark).

## Type / utility re-exports

- `IX_TAG` (filtered to vanilla subset only).
- `AUTHORITY_KIND` (only Admin = 0; HyperpMark/Insurance/InsuranceOperator
  excluded since the corresponding handlers are not in the vanilla scope).

  **Decision:** export the full `AUTHORITY_KIND` map. The constant itself
  is metadata and does not pull in any handler-specific code. This avoids
  a confusing partial enum.
- `WrapperTarget` type alias.
- `AccountSpec` interface.
- `buildAccountMetas` helper.
- `concatBytes`, `encU8/16/32/64/128`, `encI64/128`, `encPubkey`
  (so callers can build custom wire blobs if needed).

## Out of scope for vanilla

- Slab parsing / `detectSlabLayout` / `parseHeader` / `parseConfig`.
  These are read-only and could be exposed if a vanilla caller wants
  to read slab state, but the vanilla subset is encoder-focused.
- Discovery, RPC pool, Lighthouse helpers.
- NFT helpers.
- Stake helpers.

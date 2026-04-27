/**
 * @percolatorct/sdk/vanilla — minimal encoder surface for the v12.17.7
 * deployed mainnet line.
 *
 * This is the subset of the full SDK that targets unmodified Percolator
 * deployments. Fork-extended instructions (LP vault, NFTs, dispute,
 * shared vault, ADL, cross-margin) live in the main `@percolatorct/sdk`
 * entry point and are NOT re-exported here.
 *
 * See `audit-2026-04-27/vanilla-subset.md` for the authoritative list.
 *
 * Tree-shakable: importers get only the encoders they reference.
 *
 * Usage:
 * ```ts
 * import { encodeInitMarket, encodeTradeCpi } from "@percolatorct/sdk/vanilla";
 * ```
 *
 * For the fork-extended surface (LP vault, NFTs, etc.) use the default
 * entry point:
 * ```ts
 * import { encodeMintPositionNft } from "@percolatorct/sdk";
 * ```
 */
export { IX_TAG, AUTHORITY_KIND } from "./abi/instructions.js";
export type { AuthorityKind, WrapperTarget } from "./abi/instructions.js";
export { encodeAcceptAdmin, encodeAdminForceClose, encodeCloseAccount, encodeCloseSlab, encodeConvertReleasedPnl, encodeDepositCollateral, encodeDepositFeeCredits, encodeForceCloseResolved, encodeInitLP, encodeInitMarket, encodeInitUser, encodeKeeperCrank, encodeLiquidateAtOracle, encodeReclaimEmptyAccount, encodeResolveMarket, encodeResolvePermissionless, encodeSettleAccount, encodeSetOraclePriceCap, encodeTopUpInsurance, encodeTradeCpi, encodeTradeNoCpi, encodeUpdateAdmin, encodeUpdateAuthority, encodeUpdateConfig, encodeWithdrawCollateral, encodeWithdrawInsurance, encodeWithdrawInsuranceLimited, } from "./abi/instructions.js";
export type { AdminForceCloseArgs, CloseAccountArgs, ConvertReleasedPnlArgs, DepositCollateralArgs, DepositFeeCreditsArgs, InitLPArgs, InitMarketArgs, InitMarketExtendedTail, InitUserArgs, KeeperCrankArgs, KeeperCrankCandidate, LiquidateAtOracleArgs, ReclaimEmptyAccountArgs, SetOraclePriceCapArgs, SettleAccountArgs, TopUpInsuranceArgs, TradeCpiArgs, TradeNoCpiArgs, UpdateAdminArgs, UpdateAuthorityArgs, UpdateConfigArgs, WithdrawCollateralArgs, } from "./abi/instructions.js";
export { ACCOUNTS_ACCEPT_ADMIN, ACCOUNTS_ADMIN_FORCE_CLOSE, ACCOUNTS_CLOSE_ACCOUNT, ACCOUNTS_CLOSE_SLAB, ACCOUNTS_CONVERT_RELEASED_PNL, ACCOUNTS_DEPOSIT_COLLATERAL, ACCOUNTS_DEPOSIT_FEE_CREDITS, ACCOUNTS_FORCE_CLOSE_RESOLVED, ACCOUNTS_INIT_LP, ACCOUNTS_INIT_MARKET, ACCOUNTS_INIT_USER, ACCOUNTS_KEEPER_CRANK, ACCOUNTS_LIQUIDATE_AT_ORACLE, ACCOUNTS_RECLAIM_EMPTY_ACCOUNT, ACCOUNTS_RESOLVE_MARKET, ACCOUNTS_RESOLVE_PERMISSIONLESS, ACCOUNTS_SETTLE_ACCOUNT, ACCOUNTS_SET_ORACLE_PRICE_CAP, ACCOUNTS_TOPUP_INSURANCE, ACCOUNTS_TRADE_CPI, ACCOUNTS_TRADE_NOCPI, ACCOUNTS_UPDATE_ADMIN, ACCOUNTS_UPDATE_AUTHORITY, ACCOUNTS_UPDATE_CONFIG, ACCOUNTS_WITHDRAW_COLLATERAL, ACCOUNTS_WITHDRAW_INSURANCE, ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_LIVE, ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_RESOLVED, } from "./abi/accounts.js";
export type { AccountSpec } from "./abi/accounts.js";
export { buildAccountMetas } from "./abi/accounts.js";
export { concatBytes, encU8, encU16, encU32, encU64, encI64, encU128, encI128, encPubkey, } from "./abi/encode.js";

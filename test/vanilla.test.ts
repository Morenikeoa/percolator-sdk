/**
 * Vanilla subpath surface gate (audit-2026-04-27 STAGE III).
 *
 * Asserts that `@percolatorct/sdk/vanilla` exposes exactly the documented
 * vanilla subset and does not leak fork-extended symbols. Catches
 * regressions if a refactor accidentally re-exports a fork symbol.
 *
 * Source of truth: audit-2026-04-27/vanilla-subset.md.
 */
import { describe, it, expect } from "vitest";
import * as vanilla from "../src/vanilla.js";

const EXPECTED_ENCODERS = [
  "encodeAcceptAdmin",
  "encodeAdminForceClose",
  "encodeCloseAccount",
  "encodeCloseSlab",
  "encodeConvertReleasedPnl",
  "encodeDepositCollateral",
  "encodeDepositFeeCredits",
  "encodeForceCloseResolved",
  "encodeInitLP",
  "encodeInitMarket",
  "encodeInitUser",
  "encodeKeeperCrank",
  "encodeLiquidateAtOracle",
  "encodeReclaimEmptyAccount",
  "encodeResolveMarket",
  "encodeResolvePermissionless",
  "encodeSettleAccount",
  "encodeSetOraclePriceCap",
  "encodeTopUpInsurance",
  "encodeTradeCpi",
  "encodeTradeNoCpi",
  "encodeUpdateAdmin",
  "encodeUpdateAuthority",
  "encodeUpdateConfig",
  "encodeWithdrawCollateral",
  "encodeWithdrawInsurance",
  "encodeWithdrawInsuranceLimited",
] as const;

const EXPECTED_ACCOUNTS = [
  "ACCOUNTS_ACCEPT_ADMIN",
  "ACCOUNTS_ADMIN_FORCE_CLOSE",
  "ACCOUNTS_CLOSE_ACCOUNT",
  "ACCOUNTS_CLOSE_SLAB",
  "ACCOUNTS_CONVERT_RELEASED_PNL",
  "ACCOUNTS_DEPOSIT_COLLATERAL",
  "ACCOUNTS_DEPOSIT_FEE_CREDITS",
  "ACCOUNTS_FORCE_CLOSE_RESOLVED",
  "ACCOUNTS_INIT_LP",
  "ACCOUNTS_INIT_MARKET",
  "ACCOUNTS_INIT_USER",
  "ACCOUNTS_KEEPER_CRANK",
  "ACCOUNTS_LIQUIDATE_AT_ORACLE",
  "ACCOUNTS_RECLAIM_EMPTY_ACCOUNT",
  "ACCOUNTS_RESOLVE_MARKET",
  "ACCOUNTS_RESOLVE_PERMISSIONLESS",
  "ACCOUNTS_SETTLE_ACCOUNT",
  "ACCOUNTS_SET_ORACLE_PRICE_CAP",
  "ACCOUNTS_TOPUP_INSURANCE",
  "ACCOUNTS_TRADE_CPI",
  "ACCOUNTS_TRADE_NOCPI",
  "ACCOUNTS_UPDATE_ADMIN",
  "ACCOUNTS_UPDATE_AUTHORITY",
  "ACCOUNTS_UPDATE_CONFIG",
  "ACCOUNTS_WITHDRAW_COLLATERAL",
  "ACCOUNTS_WITHDRAW_INSURANCE",
  "ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_LIVE",
  "ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_RESOLVED",
] as const;

const EXPECTED_PRIMITIVES = [
  "concatBytes",
  "encU8",
  "encU16",
  "encU32",
  "encU64",
  "encI64",
  "encU128",
  "encI128",
  "encPubkey",
  "buildAccountMetas",
] as const;

const EXPECTED_OTHER = [
  "IX_TAG",
  "AUTHORITY_KIND",
] as const;

const FORBIDDEN_FORK_SYMBOLS = [
  // PERC-272/309 LP vault
  "encodeCreateLpVault",
  "encodeLpVaultDeposit",
  "encodeLpVaultWithdraw",
  "encodeLpVaultCrankFees",
  "encodeQueueWithdrawal",
  "encodeClaimQueuedWithdrawal",
  "encodeCancelQueuedWithdrawal",
  // PERC-305 ADL
  "encodeExecuteAdl",
  // PERC-306/309
  "encodeFundMarketInsurance",
  "encodeSetOiCapMultiplier",
  // PERC-314 dispute
  "encodeChallengeSettlement",
  "encodeResolveDispute",
  "encodeSetDisputeParams",
  // PERC-315 LP collateral
  "encodeDepositLpCollateral",
  "encodeWithdrawLpCollateral",
  "encodeSetLpCollateralParams",
  // PERC-608 NFT
  "encodeMintPositionNft",
  "encodeTransferPositionOwnership",
  "encodeBurnPositionNft",
  "encodeSetPendingSettlement",
  "encodeClearPendingSettlement",
  "encodeTransferOwnershipCpi",
  // PERC-622
  "encodeAdvanceOraclePhase",
  // PERC-628 shared vault
  "encodeInitSharedVault",
  "encodeAllocateMarket",
  "encodeQueueWithdrawalSV",
  "encodeClaimEpochWithdrawal",
  "encodeAdvanceEpoch",
  // PERC-8110/8111 caps
  "encodeSetWalletCap",
  "encodeSetOiImbalanceHardBlock",
  "encodeSetMaxPnlCap",
  // PERC-8270/SetDexPool
  "encodeRescueOrphanVault",
  "encodeCloseOrphanSlab",
  "encodeSetDexPool",
  // Cross-margin
  "encodeSetOffsetPair",
  "encodeAttestCrossMargin",
  // Slab recovery + audit
  "encodeCloseStaleSlabs",
  "encodeReclaimSlabRent",
  "encodeAuditCrank",
  // Pause
  "encodePauseMarket",
  "encodeUnpauseMarket",
  // Hyperp DEX EMA
  "encodeUpdateHyperpMark",
  // Insurance LP aliases
  "encodeCreateInsuranceMint",
  "encodeDepositInsuranceLP",
  "encodeWithdrawInsuranceLP",
  // Matcher CPI
  "encodeInitMatcherCtx",
  // Insurance withdraw policy (admin-only setter, not in vanilla scope)
  "encodeSetInsuranceWithdrawPolicy",
] as const;

describe("vanilla subpath surface", () => {
  it("exports every documented vanilla encoder", () => {
    for (const name of EXPECTED_ENCODERS) {
      expect(vanilla, `missing vanilla encoder ${name}`).toHaveProperty(name);
      expect(typeof (vanilla as Record<string, unknown>)[name]).toBe("function");
    }
  });

  it("exports every documented vanilla account spec", () => {
    for (const name of EXPECTED_ACCOUNTS) {
      expect(vanilla, `missing vanilla accounts ${name}`).toHaveProperty(name);
    }
  });

  it("exports the encoding primitives", () => {
    for (const name of EXPECTED_PRIMITIVES) {
      expect(vanilla, `missing vanilla primitive ${name}`).toHaveProperty(name);
    }
  });

  it("exports IX_TAG and AUTHORITY_KIND const maps", () => {
    for (const name of EXPECTED_OTHER) {
      expect(vanilla, `missing vanilla const ${name}`).toHaveProperty(name);
    }
  });

  it("does NOT leak fork-extended symbols", () => {
    for (const forbidden of FORBIDDEN_FORK_SYMBOLS) {
      expect(
        vanilla,
        `vanilla subpath leaks fork-extended symbol ${forbidden}`,
      ).not.toHaveProperty(forbidden);
    }
  });

  it("export count is bounded (defensive)", () => {
    const exportedNames = Object.keys(vanilla).filter((k) => !k.startsWith("__"));
    const expectedCount =
      EXPECTED_ENCODERS.length +
      EXPECTED_ACCOUNTS.length +
      EXPECTED_PRIMITIVES.length +
      EXPECTED_OTHER.length;
    expect(exportedNames.length).toBe(expectedCount);
  });
});

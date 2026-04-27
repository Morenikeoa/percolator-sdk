// src/abi/encode.ts
import { PublicKey } from "@solana/web3.js";
var U8_MAX = 255;
var U16_MAX = 65535;
var U32_MAX = 4294967295;
function encU8(val) {
  if (!Number.isInteger(val) || val < 0 || val > U8_MAX) {
    throw new Error(`encU8: value out of range (0..255), got ${val}`);
  }
  return new Uint8Array([val]);
}
function encU16(val) {
  if (!Number.isInteger(val) || val < 0 || val > U16_MAX) {
    throw new Error(`encU16: value out of range (0..65535), got ${val}`);
  }
  const buf = new Uint8Array(2);
  new DataView(buf.buffer).setUint16(0, val, true);
  return buf;
}
function encU32(val) {
  if (!Number.isInteger(val) || val < 0 || val > U32_MAX) {
    throw new Error(`encU32: value out of range (0..4294967295), got ${val}`);
  }
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, val, true);
  return buf;
}
function encU64(val) {
  const n = typeof val === "string" ? BigInt(val) : val;
  if (n < 0n) throw new Error("encU64: value must be non-negative");
  if (n > 0xffffffffffffffffn) throw new Error("encU64: value exceeds u64 max");
  const buf = new Uint8Array(8);
  new DataView(buf.buffer).setBigUint64(0, n, true);
  return buf;
}
function encI64(val) {
  const n = typeof val === "string" ? BigInt(val) : val;
  const min = -(1n << 63n);
  const max = (1n << 63n) - 1n;
  if (n < min || n > max) throw new Error("encI64: value out of range");
  const buf = new Uint8Array(8);
  new DataView(buf.buffer).setBigInt64(0, n, true);
  return buf;
}
function encU128(val) {
  const n = typeof val === "string" ? BigInt(val) : val;
  if (n < 0n) throw new Error("encU128: value must be non-negative");
  const max = (1n << 128n) - 1n;
  if (n > max) throw new Error("encU128: value exceeds u128 max");
  const buf = new Uint8Array(16);
  const view = new DataView(buf.buffer);
  const lo = n & 0xffffffffffffffffn;
  const hi = n >> 64n;
  view.setBigUint64(0, lo, true);
  view.setBigUint64(8, hi, true);
  return buf;
}
function encI128(val) {
  const n = typeof val === "string" ? BigInt(val) : val;
  const min = -(1n << 127n);
  const max = (1n << 127n) - 1n;
  if (n < min || n > max) throw new Error("encI128: value out of range");
  let unsigned = n;
  if (n < 0n) {
    unsigned = (1n << 128n) + n;
  }
  const buf = new Uint8Array(16);
  const view = new DataView(buf.buffer);
  const lo = unsigned & 0xffffffffffffffffn;
  const hi = unsigned >> 64n;
  view.setBigUint64(0, lo, true);
  view.setBigUint64(8, hi, true);
  return buf;
}
function encPubkey(val) {
  try {
    const pk = typeof val === "string" ? new PublicKey(val) : val;
    return pk.toBytes();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`encPubkey: invalid public key "${String(val)}" \u2014 ${msg}`);
  }
}
function concatBytes(...arrays) {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// src/abi/instructions.ts
var IX_TAG = {
  InitMarket: 0,
  InitUser: 1,
  InitLP: 2,
  DepositCollateral: 3,
  WithdrawCollateral: 4,
  KeeperCrank: 5,
  TradeNoCpi: 6,
  LiquidateAtOracle: 7,
  CloseAccount: 8,
  TopUpInsurance: 9,
  TradeCpi: 10,
  SetRiskThreshold: 11,
  UpdateAdmin: 12,
  CloseSlab: 13,
  UpdateConfig: 14,
  SetMaintenanceFee: 15,
  // 16, 17 — removed in v1.0.0-beta.29 (Phase G admin-push oracle removal)
  SetOraclePriceCap: 18,
  ResolveMarket: 19,
  WithdrawInsurance: 20,
  AdminForceClose: 21,
  // Tags 22-23: on-chain these are SetInsuranceWithdrawPolicy / WithdrawInsuranceLimited.
  // Legacy aliases (UpdateRiskParams/RenounceAdmin) kept for backward compat.
  SetInsuranceWithdrawPolicy: 22,
  /** @deprecated Use SetInsuranceWithdrawPolicy */
  UpdateRiskParams: 22,
  WithdrawInsuranceLimited: 23,
  /** @deprecated Use WithdrawInsuranceLimited */
  RenounceAdmin: 23,
  // Tags 24–26: on-chain = QueryLpFees/ReclaimEmptyAccount/SettleAccount.
  // Old insurance LP tags removed — those moved to percolator-stake.
  QueryLpFees: 24,
  ReclaimEmptyAccount: 25,
  SettleAccount: 26,
  // Tags 27-28: on-chain = DepositFeeCredits/ConvertReleasedPnl.
  DepositFeeCredits: 27,
  ConvertReleasedPnl: 28,
  // Tags 29-30: on-chain = ResolvePermissionless/ForceCloseResolved.
  ResolvePermissionless: 29,
  // Note: `AcceptAdmin` used to be a @deprecated alias for tag 29; removed in
  // beta.27 because AcceptAdmin is now a real instruction at tag 82 (Phase E).
  ForceCloseResolved: 30,
  // Tag 31: gap (no decode arm on-chain)
  SetPythOracle: 32,
  UpdateMarkPrice: 33,
  UpdateHyperpMark: 34,
  TradeCpiV2: 35,
  UnresolveMarket: 36,
  CreateLpVault: 37,
  LpVaultDeposit: 38,
  LpVaultWithdraw: 39,
  LpVaultCrankFees: 40,
  /** PERC-306: Fund per-market isolated insurance balance */
  FundMarketInsurance: 41,
  /** PERC-306: Set insurance isolation BPS for a market */
  SetInsuranceIsolation: 42,
  // Tag 43 is ChallengeSettlement on-chain (PERC-314).
  // PERC-305 (ExecuteAdl) is NOT implemented on-chain — do NOT assign tag 43 here.
  // When PERC-305 is implemented, assign a new unused tag (≥47).
  /** PERC-314: Challenge settlement price during dispute window */
  ChallengeSettlement: 43,
  /** PERC-314: Resolve dispute (admin adjudication) */
  ResolveDispute: 44,
  /** PERC-315: Deposit LP vault tokens as perp collateral */
  DepositLpCollateral: 45,
  /** PERC-315: Withdraw LP collateral (position must be closed) */
  WithdrawLpCollateral: 46,
  /** PERC-309: Queue a large LP withdrawal (user; creates withdraw_queue PDA). */
  QueueWithdrawal: 47,
  /** PERC-309: Claim one epoch tranche from a queued LP withdrawal (user). */
  ClaimQueuedWithdrawal: 48,
  /** PERC-309: Cancel a queued withdrawal, refund remaining LP tokens (user). */
  CancelQueuedWithdrawal: 49,
  /** PERC-305: Auto-deleverage — surgically close profitable positions when PnL cap is exceeded (permissionless). */
  ExecuteAdl: 50,
  /** Close a stale slab of an invalid/old layout and recover rent SOL (admin only). */
  CloseStaleSlabs: 51,
  /** Reclaim rent from an uninitialised slab whose market creation failed mid-flow. Slab must sign. */
  ReclaimSlabRent: 52,
  /** Permissionless on-chain audit crank: verifies conservation invariants and pauses market on violation. */
  AuditCrank: 53,
  /** Cross-Market Portfolio Margining: SetOffsetPair */
  SetOffsetPair: 54,
  /** Cross-Market Portfolio Margining: AttestCrossMargin */
  AttestCrossMargin: 55,
  /** PERC-622: Advance oracle phase (permissionless crank) */
  AdvanceOraclePhase: 56,
  // 57: removed (keeper fund)
  /** PERC-629: Slash a market creator's deposit (permissionless) */
  SlashCreationDeposit: 58,
  /** PERC-628: Initialize the global shared vault (admin) */
  InitSharedVault: 59,
  /** PERC-628: Allocate virtual liquidity to a market (admin) */
  AllocateMarket: 60,
  /** PERC-628: Queue a withdrawal for the current epoch */
  QueueWithdrawalSV: 61,
  /** PERC-628: Claim a queued withdrawal after epoch elapses */
  ClaimEpochWithdrawal: 62,
  /** PERC-628: Advance the shared vault epoch (permissionless crank) */
  AdvanceEpoch: 63,
  /** PERC-608: Mint a Position NFT for a user's open position. */
  MintPositionNft: 64,
  /** PERC-608: Transfer position ownership via the NFT (keeper-gated). */
  TransferPositionOwnership: 65,
  /** PERC-608: Burn the Position NFT when a position is closed. */
  BurnPositionNft: 66,
  /** PERC-608: Keeper sets pending_settlement flag before a funding transfer. */
  SetPendingSettlement: 67,
  /** PERC-608: Keeper clears pending_settlement flag after KeeperCrank. */
  ClearPendingSettlement: 68,
  /** PERC-608: Internal CPI call from percolator-nft TransferHook to update on-chain owner. */
  TransferOwnershipCpi: 69,
  /** PERC-8111: Set per-wallet position cap (admin only, cap_e6=0 disables). */
  SetWalletCap: 70,
  /** PERC-8110: Set OI imbalance hard-block threshold (admin only). */
  SetOiImbalanceHardBlock: 71,
  /** PERC-8270: Rescue orphan vault — recover tokens from a closed market's vault (admin). */
  RescueOrphanVault: 72,
  /** PERC-8270: Close orphan slab — reclaim rent from a slab whose market closed unexpectedly (admin). */
  CloseOrphanSlab: 73,
  /** PERC-SetDexPool: Pin admin-approved DEX pool address for a HYPERP market (admin). */
  SetDexPool: 74,
  /** CPI to the matcher program to initialize a matcher context account for an LP slot. Admin-only. */
  InitMatcherCtx: 75,
  /** PauseMarket (tag 76): admin emergency pause. Blocks Trade/Deposit/Withdraw/InitUser. */
  PauseMarket: 76,
  /** UnpauseMarket (tag 77): admin unpause. Re-enables all operations. */
  UnpauseMarket: 77,
  /** PERC-305 / SECURITY(H-4): Set PnL cap for ADL pre-check (admin only). */
  SetMaxPnlCap: 78,
  /** PERC-309: Set OI cap multiplier for LP withdrawal limits (admin only). Packed u64. */
  SetOiCapMultiplier: 79,
  /** PERC-314: Set dispute params (window_slots + bond_amount, admin only). */
  SetDisputeParams: 80,
  /** PERC-315: Set LP collateral params (enabled + ltv_bps, admin only). */
  SetLpCollateralParams: 81,
  /** Phase E (2026-04-17): Accept a pending admin transfer. Signer must match pending_admin. */
  AcceptAdmin: 82,
  /**
   * v12.18.x 4-way authority split (added 2026-04-22, wrapper 86ea41f).
   * Unified mutator for admin/hyperp_mark/insurance/insurance_operator.
   * Wrapper handler: src/percolator.rs:6876.
   */
  UpdateAuthority: 83
  // 78: removed (keeper fund)
};
Object.freeze(IX_TAG);
var HEX_RE = /^[0-9a-fA-F]{64}$/;
function encodeFeedId(feedId) {
  const hex = feedId.startsWith("0x") ? feedId.slice(2) : feedId;
  if (!HEX_RE.test(hex)) {
    throw new Error(
      `Invalid feed ID: expected 64 hex chars, got "${hex.length === 64 ? "non-hex characters" : hex.length + " chars"}"`
    );
  }
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 64; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16);
    if (Number.isNaN(byte)) {
      throw new Error(
        `Failed to parse hex byte at position ${i}: "${hex.substring(i, i + 2)}"`
      );
    }
    bytes[i / 2] = byte;
  }
  return bytes;
}
var INIT_MARKET_BASE_LEN = 344;
var INIT_MARKET_BASE_LEN_V12_19 = 304;
var INIT_MARKET_EXTENDED_TAIL_LEN = 66;
function extendedTailHasNonZero(t) {
  const toBigInt = (v) => typeof v === "string" ? BigInt(v) : v;
  return t.insuranceWithdrawMaxBps !== 0 || toBigInt(t.insuranceWithdrawCooldownSlots) !== 0n || toBigInt(t.permissionlessResolveStaleSlots) !== 0n || toBigInt(t.fundingHorizonSlots) !== 0n || toBigInt(t.fundingKBps) !== 0n || toBigInt(t.fundingMaxPremiumBps) !== 0n || toBigInt(t.fundingMaxBpsPerSlot) !== 0n || toBigInt(t.markMinFee) !== 0n || toBigInt(t.forceCloseDelaySlots) !== 0n;
}
function encodeExtendedTail(t) {
  return concatBytes(
    encU16(t.insuranceWithdrawMaxBps),
    encU64(t.insuranceWithdrawCooldownSlots),
    encU64(t.permissionlessResolveStaleSlots),
    encU64(t.fundingHorizonSlots),
    encU64(t.fundingKBps),
    encI64(t.fundingMaxPremiumBps),
    encI64(t.fundingMaxBpsPerSlot),
    encU64(t.markMinFee),
    encU64(t.forceCloseDelaySlots)
  );
}
function encodeInitMarket(args) {
  const hMin = args.hMin ?? args.warmupPeriodSlots ?? 0n;
  const hMax = args.hMax ?? args.warmupPeriodSlots ?? 0n;
  const target = args.target ?? "v12.17";
  const header = concatBytes(
    encU8(IX_TAG.InitMarket),
    encPubkey(args.admin),
    encPubkey(args.collateralMint),
    encodeFeedId(args.indexFeedId),
    encU64(args.maxStalenessSecs),
    encU16(args.confFilterBps),
    encU8(args.invert),
    encU32(args.unitScale),
    encU64(args.initialMarkPriceE6),
    encU128(args.maxMaintenanceFeePerSlot ?? 0n)
  );
  const preRiskParams_v17 = concatBytes(
    encU128(args.maxInsuranceFloor ?? 0n),
    encU64(args.minOraclePriceCap ?? 0n)
  );
  const riskParamsCommon = concatBytes(
    encU64(hMin),
    encU64(args.maintenanceMarginBps),
    encU64(args.initialMarginBps),
    encU64(args.tradingFeeBps),
    encU64(args.maxAccounts),
    encU128(args.newAccountFee),
    encU128(args.insuranceFloor ?? 0n),
    // wire slot: old riskReductionThreshold → now insurance_floor
    encU64(hMax),
    // h_max (u64)
    encU64(args.maxCrankStalenessSlots),
    // v12.17: no padding between hMax and maxCrankStalenessSlots
    encU64(args.liquidationFeeBps),
    encU128(args.liquidationFeeCap),
    encU64(args.liquidationBufferBps ?? 0n),
    // v12.17: read as resolve_price_deviation_bps by program
    encU128(args.minLiquidationAbs)
  );
  const minInitialDeposit_v17 = encU128(args.minInitialDeposit);
  const riskParamsTail = concatBytes(
    encU128(args.minNonzeroMmReq),
    encU128(args.minNonzeroImReq)
  );
  const base = target === "v12.19" ? concatBytes(header, riskParamsCommon, riskParamsTail) : concatBytes(header, preRiskParams_v17, riskParamsCommon, minInitialDeposit_v17, riskParamsTail);
  const expectedLen = target === "v12.19" ? INIT_MARKET_BASE_LEN_V12_19 : INIT_MARKET_BASE_LEN;
  if (base.length !== expectedLen) {
    throw new Error(
      `encodeInitMarket: base payload expected ${expectedLen} bytes, got ${base.length}`
    );
  }
  if (args.extendedTail && extendedTailHasNonZero(args.extendedTail)) {
    const tail = encodeExtendedTail(args.extendedTail);
    if (tail.length !== INIT_MARKET_EXTENDED_TAIL_LEN) {
      throw new Error(
        `encodeInitMarket: extended tail expected ${INIT_MARKET_EXTENDED_TAIL_LEN} bytes, got ${tail.length}`
      );
    }
    return concatBytes(base, tail);
  }
  return base;
}
function encodeInitUser(args) {
  return concatBytes(encU8(IX_TAG.InitUser), encU64(args.feePayment));
}
function encodeInitLP(args) {
  return concatBytes(
    encU8(IX_TAG.InitLP),
    encPubkey(args.matcherProgram),
    encPubkey(args.matcherContext),
    encU64(args.feePayment)
  );
}
function encodeDepositCollateral(args) {
  return concatBytes(
    encU8(IX_TAG.DepositCollateral),
    encU16(args.userIdx),
    encU64(args.amount)
  );
}
function encodeWithdrawCollateral(args) {
  return concatBytes(
    encU8(IX_TAG.WithdrawCollateral),
    encU16(args.userIdx),
    encU64(args.amount)
  );
}
var LiquidationPolicyTag = {
  FullClose: 0,
  ExactPartial: 1,
  TouchOnly: 255
};
function encodeKeeperCrank(args) {
  const parts = [
    encU8(IX_TAG.KeeperCrank),
    encU16(args.callerIdx),
    encU8(1)
    // format_version = 1 (REQUIRED by v12.17)
  ];
  if (args.candidates) {
    for (const c of args.candidates) {
      parts.push(encU16(c.idx));
      parts.push(encU8(c.policy));
      if (c.policy === LiquidationPolicyTag.ExactPartial) {
        parts.push(encU128(c.quantity));
      }
    }
  }
  return concatBytes(...parts);
}
function encodeTradeNoCpi(args) {
  return concatBytes(
    encU8(IX_TAG.TradeNoCpi),
    encU16(args.lpIdx),
    encU16(args.userIdx),
    encI128(args.size)
  );
}
function encodeLiquidateAtOracle(args) {
  return concatBytes(
    encU8(IX_TAG.LiquidateAtOracle),
    encU16(args.targetIdx)
  );
}
function encodeCloseAccount(args) {
  return concatBytes(encU8(IX_TAG.CloseAccount), encU16(args.userIdx));
}
function encodeTopUpInsurance(args) {
  return concatBytes(encU8(IX_TAG.TopUpInsurance), encU64(args.amount));
}
function encodeTradeCpi(args) {
  return concatBytes(
    encU8(IX_TAG.TradeCpi),
    encU16(args.lpIdx),
    encU16(args.userIdx),
    encI128(args.size),
    encU64(args.limitPriceE6)
  );
}
function encodeUpdateAdmin(args) {
  return concatBytes(encU8(IX_TAG.UpdateAdmin), encPubkey(args.newAdmin));
}
function encodeCloseSlab() {
  return encU8(IX_TAG.CloseSlab);
}
function encodeUpdateConfig(args) {
  const base = concatBytes(
    encU8(IX_TAG.UpdateConfig),
    encU64(args.fundingHorizonSlots),
    encU64(args.fundingKBps),
    encI64(args.fundingMaxPremiumBps),
    // Rust: i64 (can be negative)
    encI64(args.fundingMaxBpsPerSlot)
    // Rust: i64 (can be negative)
  );
  if (args.target === "v12.19") {
    return concatBytes(base, encU16(args.tvlInsuranceCapMult ?? 0));
  }
  return base;
}
function encodeSetOraclePriceCap(args) {
  return concatBytes(
    encU8(IX_TAG.SetOraclePriceCap),
    encU64(args.maxChangeE2bps)
  );
}
function encodeResolveMarket() {
  return encU8(IX_TAG.ResolveMarket);
}
function encodeWithdrawInsurance() {
  return encU8(IX_TAG.WithdrawInsurance);
}
function encodeAdminForceClose(args) {
  return concatBytes(
    encU8(IX_TAG.AdminForceClose),
    encU16(args.targetIdx)
  );
}
var MARK_PRICE_EMA_WINDOW_SLOTS = 72000n;
var MARK_PRICE_EMA_ALPHA_E6 = 2000000n / (MARK_PRICE_EMA_WINDOW_SLOTS + 1n);
function encodeWithdrawInsuranceLimited(args) {
  return concatBytes(encU8(IX_TAG.WithdrawInsuranceLimited), encU64(args.amount));
}
function encodeResolvePermissionless() {
  return concatBytes(encU8(IX_TAG.ResolvePermissionless));
}
function encodeForceCloseResolved(args) {
  return concatBytes(encU8(IX_TAG.ForceCloseResolved), encU16(args.userIdx));
}
function encodeAcceptAdmin() {
  return encU8(IX_TAG.AcceptAdmin);
}
function encodeReclaimEmptyAccount(args) {
  return concatBytes(encU8(IX_TAG.ReclaimEmptyAccount), encU16(args.userIdx));
}
function encodeSettleAccount(args) {
  return concatBytes(encU8(IX_TAG.SettleAccount), encU16(args.userIdx));
}
function encodeDepositFeeCredits(args) {
  return concatBytes(
    encU8(IX_TAG.DepositFeeCredits),
    encU16(args.userIdx),
    encU64(args.amount)
  );
}
function encodeConvertReleasedPnl(args) {
  return concatBytes(
    encU8(IX_TAG.ConvertReleasedPnl),
    encU16(args.userIdx),
    encU64(args.amount)
  );
}
var AUTHORITY_KIND = {
  Admin: 0,
  HyperpMark: 1,
  Insurance: 2,
  InsuranceOperator: 4
};
Object.freeze(AUTHORITY_KIND);
function encodeUpdateAuthority(args) {
  return concatBytes(
    encU8(IX_TAG.UpdateAuthority),
    encU8(args.kind),
    encPubkey(args.newPubkey)
  );
}

// src/abi/accounts.ts
import {
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
var ACCOUNTS_INIT_MARKET = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "mint", signer: false, writable: false },
  { name: "vault", signer: false, writable: false },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false },
  { name: "rent", signer: false, writable: false },
  { name: "dummyAta", signer: false, writable: false },
  { name: "systemProgram", signer: false, writable: false }
];
var ACCOUNTS_INIT_USER = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_INIT_LP = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_DEPOSIT_COLLATERAL = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_WITHDRAW_COLLATERAL = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vaultPda", signer: false, writable: false },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false },
  { name: "oracleIdx", signer: false, writable: false }
];
var ACCOUNTS_KEEPER_CRANK = [
  { name: "caller", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_TRADE_NOCPI = [
  { name: "user", signer: true, writable: true },
  { name: "lp", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_LIQUIDATE_AT_ORACLE = [
  { name: "unused", signer: false, writable: false },
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_CLOSE_ACCOUNT = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vaultPda", signer: false, writable: false },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_TOPUP_INSURANCE = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false }
];
var ACCOUNTS_TRADE_CPI = [
  { name: "user", signer: true, writable: true },
  { name: "lpOwner", signer: false, writable: false },
  // LP delegated to matcher - no signature needed
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false },
  { name: "matcherProg", signer: false, writable: false },
  { name: "matcherCtx", signer: false, writable: true },
  { name: "lpPda", signer: false, writable: false }
];
var ACCOUNTS_UPDATE_ADMIN = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true }
];
var ACCOUNTS_ACCEPT_ADMIN = [
  { name: "pendingAdmin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true }
];
var ACCOUNTS_CLOSE_SLAB = [
  { name: "dest", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "vaultAuthority", signer: false, writable: false },
  { name: "destAta", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false }
];
var ACCOUNTS_UPDATE_CONFIG = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true }
];
var ACCOUNTS_SET_ORACLE_PRICE_CAP = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true }
];
var ACCOUNTS_RESOLVE_MARKET = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true }
];
var ACCOUNTS_WITHDRAW_INSURANCE = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "adminAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "vaultPda", signer: false, writable: false }
];
var ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_RESOLVED = [
  { name: "authority", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "authorityAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "vaultPda", signer: false, writable: false },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_LIVE = [
  ...ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_RESOLVED,
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_RECLAIM_EMPTY_ACCOUNT = [
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_SETTLE_ACCOUNT = [
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_DEPOSIT_FEE_CREDITS = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "userAta", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false }
];
var ACCOUNTS_CONVERT_RELEASED_PNL = [
  { name: "user", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_UPDATE_AUTHORITY = [
  { name: "currentAuthority", signer: true, writable: false },
  { name: "newAuthority", signer: true, writable: false },
  { name: "slab", signer: false, writable: true }
];
function buildAccountMetas(spec, keys) {
  let keysArray;
  if (Array.isArray(keys)) {
    keysArray = keys;
  } else {
    keysArray = spec.map((s) => {
      const key = keys[s.name];
      if (!key) {
        throw new Error(
          `buildAccountMetas: missing key for account "${s.name}". Provided keys: [${Object.keys(keys).join(", ")}]`
        );
      }
      return key;
    });
  }
  if (keysArray.length !== spec.length) {
    throw new Error(
      `Account count mismatch: expected ${spec.length}, got ${keysArray.length}`
    );
  }
  return spec.map((s, i) => ({
    pubkey: keysArray[i],
    isSigner: s.signer,
    isWritable: s.writable
  }));
}
var ACCOUNTS_RESOLVE_PERMISSIONLESS = [
  { name: "slab", signer: false, writable: true },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_FORCE_CLOSE_RESOLVED = [
  { name: "slab", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "ownerAta", signer: false, writable: true },
  { name: "vaultAuthority", signer: false, writable: false },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var ACCOUNTS_ADMIN_FORCE_CLOSE = [
  { name: "admin", signer: true, writable: true },
  { name: "slab", signer: false, writable: true },
  { name: "vault", signer: false, writable: true },
  { name: "ownerAta", signer: false, writable: true },
  { name: "vaultAuthority", signer: false, writable: false },
  { name: "tokenProgram", signer: false, writable: false },
  { name: "clock", signer: false, writable: false },
  { name: "oracle", signer: false, writable: false }
];
var WELL_KNOWN = {
  tokenProgram: TOKEN_PROGRAM_ID,
  clock: SYSVAR_CLOCK_PUBKEY,
  rent: SYSVAR_RENT_PUBKEY,
  systemProgram: SystemProgram.programId
};
export {
  ACCOUNTS_ACCEPT_ADMIN,
  ACCOUNTS_ADMIN_FORCE_CLOSE,
  ACCOUNTS_CLOSE_ACCOUNT,
  ACCOUNTS_CLOSE_SLAB,
  ACCOUNTS_CONVERT_RELEASED_PNL,
  ACCOUNTS_DEPOSIT_COLLATERAL,
  ACCOUNTS_DEPOSIT_FEE_CREDITS,
  ACCOUNTS_FORCE_CLOSE_RESOLVED,
  ACCOUNTS_INIT_LP,
  ACCOUNTS_INIT_MARKET,
  ACCOUNTS_INIT_USER,
  ACCOUNTS_KEEPER_CRANK,
  ACCOUNTS_LIQUIDATE_AT_ORACLE,
  ACCOUNTS_RECLAIM_EMPTY_ACCOUNT,
  ACCOUNTS_RESOLVE_MARKET,
  ACCOUNTS_RESOLVE_PERMISSIONLESS,
  ACCOUNTS_SETTLE_ACCOUNT,
  ACCOUNTS_SET_ORACLE_PRICE_CAP,
  ACCOUNTS_TOPUP_INSURANCE,
  ACCOUNTS_TRADE_CPI,
  ACCOUNTS_TRADE_NOCPI,
  ACCOUNTS_UPDATE_ADMIN,
  ACCOUNTS_UPDATE_AUTHORITY,
  ACCOUNTS_UPDATE_CONFIG,
  ACCOUNTS_WITHDRAW_COLLATERAL,
  ACCOUNTS_WITHDRAW_INSURANCE,
  ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_LIVE,
  ACCOUNTS_WITHDRAW_INSURANCE_LIMITED_RESOLVED,
  AUTHORITY_KIND,
  IX_TAG,
  buildAccountMetas,
  concatBytes,
  encI128,
  encI64,
  encPubkey,
  encU128,
  encU16,
  encU32,
  encU64,
  encU8,
  encodeAcceptAdmin,
  encodeAdminForceClose,
  encodeCloseAccount,
  encodeCloseSlab,
  encodeConvertReleasedPnl,
  encodeDepositCollateral,
  encodeDepositFeeCredits,
  encodeForceCloseResolved,
  encodeInitLP,
  encodeInitMarket,
  encodeInitUser,
  encodeKeeperCrank,
  encodeLiquidateAtOracle,
  encodeReclaimEmptyAccount,
  encodeResolveMarket,
  encodeResolvePermissionless,
  encodeSetOraclePriceCap,
  encodeSettleAccount,
  encodeTopUpInsurance,
  encodeTradeCpi,
  encodeTradeNoCpi,
  encodeUpdateAdmin,
  encodeUpdateAuthority,
  encodeUpdateConfig,
  encodeWithdrawCollateral,
  encodeWithdrawInsurance,
  encodeWithdrawInsuranceLimited
};
//# sourceMappingURL=vanilla.js.map
export const CHALLENGE_PRICES: Record<string, number> = {
  bf10k: 3000,
  bf25k: 7000,
  bf50k: 12000,
  bf100k: 20000,
};

export const CHALLENGE_VIRTUAL: Record<string, number> = {
  bf10k: 10000,
  bf25k: 25000,
  bf50k: 50000,
  bf100k: 100000,
};

export const PLAN_LABELS: Record<string, string> = {
  bf10k: 'BF 10K',
  bf25k: 'BF 25K',
  bf50k: 'BF 50K',
  bf100k: 'BF 100K',
};

export const CHALLENGE_PHASES = {
  phase1: {
    label: 'Phase 1 — Evaluation',
    profitTarget: 10,
    minTradingDays: 5,
  },
  phase2: {
    label: 'Phase 2 — Verification',
    profitTarget: 5,
    minTradingDays: 3,
  },
};

export const FUNDED_CONFIG = {
  profitSplit: 80,
  payoutDays: 14,
  feeRefund: true,
  scalingMonths: 3,
  scalingIncrease: 50,
  consistencyPct: 50,
};

export function getChallengeConfig(challengeType: string) {
  return {
    virtualBalance: CHALLENGE_VIRTUAL[challengeType] || 25000,
    profitTarget: 10,
    dailyLoss: 5,
    maxLoss: 10,
    price: CHALLENGE_PRICES[challengeType] || 7000,
    phase2ProfitTarget: 5,
    minTradingDaysPhase1: 5,
    minTradingDaysPhase2: 3,
    consistencyRule: 50,
    profitSplit: 80,
    payoutDays: 14,
    feeRefund: true,
    scalingMonths: 3,
    scalingIncrease: 50,
  };
}

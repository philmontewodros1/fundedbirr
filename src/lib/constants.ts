export const CHALLENGE_PRICES: Record<string, number> = {
  bf5k: 1500,
  bf10k: 3000,
  bf25k: 7000,
  bf50k: 12000,
  bf100k: 20000,
};

export const CHALLENGE_VIRTUAL: Record<string, number> = {
  bf5k: 5000,
  bf10k: 10000,
  bf25k: 25000,
  bf50k: 50000,
  bf100k: 100000,
};

export const PLAN_LABELS: Record<string, string> = {
  bf5k: 'BF 5K',
  bf10k: 'BF 10K',
  bf25k: 'BF 25K',
  bf50k: 'BF 50K',
  bf100k: 'BF 100K',
};

export const PLAN_TO_TYPE: Record<string, string> = {
  starter: 'bf5k',
  standard: 'bf10k',
  pro: 'bf25k',
  elite: 'bf50k',
  legend: 'bf100k',
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

export const CHALLENGE_MODELS: Record<string, { label: string, description: string }> = {
  '2step': { label: '2-Step Evaluation', description: 'Phase 1 (10%) → Phase 2 (5%) → Funded' },
  '1step': { label: '1-Step Evaluation', description: 'Single Phase (10%) → Funded' },
};

export const INSTRUMENTS: Record<string, { label: string, contractSize: number, category: string }> = {
  XAUUSD: { label: 'XAUUSD · Gold', contractSize: 100, category: 'Commodities' },
  XAGUSD: { label: 'XAGUSD · Silver', contractSize: 5000, category: 'Commodities' },
  EURUSD: { label: 'EURUSD', contractSize: 100000, category: 'Forex' },
  GBPUSD: { label: 'GBPUSD', contractSize: 100000, category: 'Forex' },
  USDJPY: { label: 'USDJPY', contractSize: 100000, category: 'Forex' },
  AUDUSD: { label: 'AUDUSD', contractSize: 100000, category: 'Forex' },
  USDCAD: { label: 'USDCAD', contractSize: 100000, category: 'Forex' },
  NZDUSD: { label: 'NZDUSD', contractSize: 100000, category: 'Forex' },
  EURJPY: { label: 'EURJPY', contractSize: 100000, category: 'Forex' },
  GBPJPY: { label: 'GBPJPY', contractSize: 100000, category: 'Forex' },
  BTCUSD: { label: 'BTCUSD · Bitcoin', contractSize: 1, category: 'Crypto' },
  SPX500: { label: 'SPX500 · S&P 500', contractSize: 100, category: 'Indices' },
  US30:   { label: 'US30 · Dow Jones', contractSize: 100, category: 'Indices' },
  NAS100: { label: 'NAS100 · Nasdaq', contractSize: 100, category: 'Indices' },
};

export const INSTRUMENT_LIST = Object.keys(INSTRUMENTS)

export function getContractSize(symbol: string): number {
  return INSTRUMENTS[symbol]?.contractSize || 100
}

export function getPipValue(symbol: string, lotSize: number): number {
  const cs = getContractSize(symbol)
  const pip = symbol.includes('JPY') ? 0.01 : 0.0001
  return pip * lotSize * cs
}

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

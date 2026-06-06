export const CHALLENGE_PRICES: Record<string, number> = {
  starter: 1500,
  standard: 3000,
  pro: 7000,
  elite: 12000,
  legend: 20000,
};

export const CHALLENGE_VIRTUAL: Record<string, number> = {
  starter: 5000,
  standard: 10000,
  pro: 25000,
  elite: 50000,
  legend: 100000,
};

export const PLAN_LABELS: Record<string, string> = {
  starter: '$5K Starter',
  standard: '$10K Standard',
  pro: '$25K Pro',
  elite: '$50K Elite',
  legend: '$100K Legend',
};

export function getChallengeConfig(challengeType: string) {
  const isSmall = challengeType === 'starter' || challengeType === 'standard';
  return {
    virtualBalance: CHALLENGE_VIRTUAL[challengeType] || 25000,
    profitTarget: isSmall ? 8 : 10,
    dailyLoss: isSmall ? 4 : 5,
    maxLoss: isSmall ? 8 : 10,
    price: CHALLENGE_PRICES[challengeType] || 7000,
  };
}

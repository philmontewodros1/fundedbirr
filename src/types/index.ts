export interface ChallengePlan {
  name: string;
  virtual: string;
  price: string;
  target: string;
  dailyLoss: string;
  maxLoss: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  profit: string;
  badge?: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Traders Leaderboard — FundedBirr',
  description: 'See Ethiopia\'s top funded traders ranked by profit percentage and win rate.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

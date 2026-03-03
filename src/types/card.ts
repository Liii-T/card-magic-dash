export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  baseReward: number;
  bonusReward: number;
  rewardCap: number;
  spendingThreshold: number;
  expiryDate: string;
  monthlySpent: number;
}

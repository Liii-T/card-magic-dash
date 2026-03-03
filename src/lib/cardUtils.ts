import { CreditCard } from "@/types/card";

export const CARD_GRADIENTS = [
  "card-gradient-1",
  "card-gradient-2", 
  "card-gradient-3",
  "card-gradient-4",
] as const;

export function getCardGradient(index: number): string {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

export function calculateReward(card: CreditCard): number {
  const totalRate = card.baseReward + card.bonusReward;
  return Math.min(card.monthlySpent * (totalRate / 100), card.rewardCap);
}

export function getRewardProgress(card: CreditCard): number {
  const reward = calculateReward(card);
  return card.rewardCap > 0 ? Math.min((reward / card.rewardCap) * 100, 100) : 0;
}

export function getSpendingProgress(card: CreditCard): number {
  return card.spendingThreshold > 0
    ? Math.min((card.monthlySpent / card.spendingThreshold) * 100, 100)
    : 0;
}

export function getDaysUntilExpiry(card: CreditCard): number {
  const now = new Date();
  const expiry = new Date(card.expiryDate);
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(card: CreditCard): boolean {
  const days = getDaysUntilExpiry(card);
  return days >= 0 && days <= 7;
}

export function isRewardNearCap(card: CreditCard): boolean {
  return getRewardProgress(card) >= 80;
}

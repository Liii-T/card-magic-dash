import { CreditCard, RewardRule } from "@/types/card";

export const CARD_GRADIENTS = [
  "card-gradient-1",
  "card-gradient-2", 
  "card-gradient-3",
  "card-gradient-4",
] as const;

export function getCardGradient(index: number): string {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
}

export function calculateRuleReward(rule: RewardRule): number {
  const totalRate = rule.baseReward + rule.bonusReward;
  return Math.min(rule.monthlySpent * (totalRate / 100), rule.rewardCap > 0 ? rule.rewardCap : Infinity);
}

export function calculateReward(card: CreditCard): number {
  return card.rewardRules.reduce((sum, rule) => sum + calculateRuleReward(rule), 0);
}

export function getRuleRewardProgress(rule: RewardRule): number {
  if (rule.rewardCap <= 0) return 0;
  const reward = calculateRuleReward(rule);
  return Math.min((reward / rule.rewardCap) * 100, 100);
}

export function getRuleSpendingProgress(rule: RewardRule): number {
  if (rule.spendingThreshold <= 0) return 0;
  return Math.min((rule.monthlySpent / rule.spendingThreshold) * 100, 100);
}

export function getTotalMonthlySpent(card: CreditCard): number {
  return card.rewardRules.reduce((sum, rule) => sum + rule.monthlySpent, 0);
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

export function isRuleNearCap(rule: RewardRule): boolean {
  return getRuleRewardProgress(rule) >= 80;
}

export function hasAnyRuleNearCap(card: CreditCard): boolean {
  return card.rewardRules.some(isRuleNearCap);
}

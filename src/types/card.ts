export type SpendingCategory = "domestic" | "foreign" | "easycard" | "special";

export const SPENDING_CATEGORY_LABELS: Record<SpendingCategory, string> = {
  domestic: "國內消費",
  foreign: "國外消費",
  easycard: "悠遊卡儲值",
  special: "指定通路加碼",
};

export interface RewardRule {
  category: SpendingCategory;
  baseReward: number;
  bonusReward: number;
  rewardCap: number;
  spendingThreshold: number;
  monthlySpent: number;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  expiryDate: string;
  rewardRules: RewardRule[];
}

export interface GoogleSheetConfig {
  sheetId: string;
  sheetName: string;
  columnMapping: {
    date: string;
    amount: string;
    type: string;
    paymentTool: string; // 補上這行
    cardName: string;
  };
  syncFrequency: "manual" | "daily" | "hourly";
  lastSyncAt?: string;
  connected: boolean;
}

export function createDefaultRule(category: SpendingCategory): RewardRule {
  return {
    category,
    baseReward: 0,
    bonusReward: 0,
    rewardCap: 0,
    spendingThreshold: 0,
    monthlySpent: 0,
  };
}

import { CreditCard, SPENDING_CATEGORY_LABELS, SpendingCategory } from "@/types/card";
import { calculateReward, calculateRuleReward, isExpiringSoon, getDaysUntilExpiry, getTotalMonthlySpent } from "@/lib/cardUtils";
import { DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface DashboardStatsProps {
  cards: CreditCard[];
}

export function DashboardStats({ cards }: DashboardStatsProps) {
  const totalSpent = cards.reduce((sum, c) => sum + getTotalMonthlySpent(c), 0);
  const totalReward = cards.reduce((sum, c) => sum + calculateReward(c), 0);
  const expiringCards = cards.filter(isExpiringSoon);

  // Aggregate by category
  const categoryStats = cards.reduce<Record<SpendingCategory, { spent: number; reward: number }>>((acc, card) => {
    card.rewardRules.forEach((rule) => {
      if (!acc[rule.category]) acc[rule.category] = { spent: 0, reward: 0 };
      acc[rule.category].spent += rule.monthlySpent;
      acc[rule.category].reward += calculateRuleReward(rule);
    });
    return acc;
  }, {} as any);

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">本月總消費</span>
          </div>
          <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="gradient-gold rounded-xl p-4">
          <div className="flex items-center gap-2 text-accent-foreground/80 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">本月總回饋</span>
          </div>
          <p className="text-2xl font-bold text-accent-foreground">${totalReward.toLocaleString()}</p>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h3 className="text-sm font-semibold">分類回饋統計</h3>
          {(Object.entries(categoryStats) as [SpendingCategory, { spent: number; reward: number }][]).map(([cat, stats]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{SPENDING_CATEGORY_LABELS[cat]}</span>
              <div className="text-right">
                <span className="font-medium">${stats.reward.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground ml-2">/ 消費 ${stats.spent.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expiring alerts */}
      {expiringCards.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">活動即將到期</h3>
          </div>
          <div className="space-y-2">
            {expiringCards.map((card) => (
              <div key={card.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{card.name}</span>
                  <span className="text-muted-foreground ml-2">{card.bank}</span>
                </div>
                <span className="flex items-center gap-1 text-destructive font-medium text-xs">
                  <Clock className="h-3 w-3" />
                  {getDaysUntilExpiry(card)} 天
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">管理中的卡片</span>
          <span className="text-lg font-bold">{cards.length} 張</span>
        </div>
      </div>
    </div>
  );
}

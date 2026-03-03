import { CreditCard } from "@/types/card";
import { calculateReward, isExpiringSoon, getDaysUntilExpiry } from "@/lib/cardUtils";
import { DollarSign, TrendingUp, AlertTriangle, Clock } from "lucide-react";

interface DashboardStatsProps {
  cards: CreditCard[];
}

export function DashboardStats({ cards }: DashboardStatsProps) {
  const totalSpent = cards.reduce((sum, c) => sum + c.monthlySpent, 0);
  const totalReward = cards.reduce((sum, c) => sum + calculateReward(c), 0);
  const expiringCards = cards.filter(isExpiringSoon);

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

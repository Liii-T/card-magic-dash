import { CreditCard, SPENDING_CATEGORY_LABELS } from "@/types/card";
import { getCardGradient, calculateReward, calculateRuleReward, getRuleRewardProgress, getRuleSpendingProgress, getTotalMonthlySpent, getDaysUntilExpiry, isExpiringSoon, isRuleNearCap } from "@/lib/cardUtils";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Pencil, Trash2, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CreditCardItemProps {
  card: CreditCard;
  index: number;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  domestic: "bg-info/15 text-info",
  foreign: "bg-accent/20 text-accent-foreground",
  easycard: "bg-success/15 text-success",
  special: "bg-warning/15 text-warning",
};

export function CreditCardItem({ card, index, onEdit, onDelete }: CreditCardItemProps) {
  const [expanded, setExpanded] = useState(false);
  const totalReward = calculateReward(card);
  const totalSpent = getTotalMonthlySpent(card);
  const daysLeft = getDaysUntilExpiry(card);
  const expiring = isExpiringSoon(card);
  const nearCapRules = card.rewardRules.filter(isRuleNearCap);

  return (
    <div className="animate-slide-up">
      {/* Card visual */}
      <div className={`${getCardGradient(index)} rounded-xl p-5 text-primary-foreground relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-sm opacity-80">{card.bank}</p>
            <h3 className="text-lg font-bold mt-0.5">{card.name}</h3>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" onClick={() => onEdit(card)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" onClick={() => onDelete(card.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 relative z-10">
          <div>
            <p className="text-xs opacity-70">消費分類</p>
            <p className="text-lg font-bold">{card.rewardRules.length} 種</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs opacity-70">本月總回饋</p>
            <p className="text-lg font-bold">${totalReward.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Card details */}
      <div className="bg-card rounded-xl -mt-2 pt-5 px-4 pb-4 border border-border space-y-3">
        {/* Alerts */}
        <div className="flex flex-wrap gap-2">
          {expiring && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Clock className="h-3 w-3" /> 剩餘 {daysLeft} 天到期
            </Badge>
          )}
          {nearCapRules.map((rule) => (
            <Badge key={rule.category} className="text-xs gap-1 bg-warning text-warning-foreground">
              <AlertTriangle className="h-3 w-3" /> {SPENDING_CATEGORY_LABELS[rule.category]} 回饋即將達上限
            </Badge>
          ))}
        </div>

        {/* Category rules - show first, expand for rest */}
        {card.rewardRules.slice(0, expanded ? undefined : 1).map((rule) => {
          const ruleReward = calculateRuleReward(rule);
          const rewardProg = getRuleRewardProgress(rule);
          const spendProg = getRuleSpendingProgress(rule);
          return (
            <div key={rule.category} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[rule.category] || "bg-muted text-muted-foreground"}`}>
                  {SPENDING_CATEGORY_LABELS[rule.category]}
                </span>
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {rule.baseReward}% + {rule.bonusReward}%
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">消費進度</span>
                  <span className="font-medium">${rule.monthlySpent.toLocaleString()} / ${rule.spendingThreshold.toLocaleString()}</span>
                </div>
                <Progress value={spendProg} className="h-1.5" />
              </div>
              {rule.rewardCap > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">回饋進度</span>
                    <span className="font-medium">${ruleReward.toLocaleString()} / ${rule.rewardCap.toLocaleString()}</span>
                  </div>
                  <Progress value={rewardProg} className="h-1.5" />
                </div>
              )}
            </div>
          );
        })}

        {card.rewardRules.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary font-medium w-full justify-center py-1 hover:bg-muted/50 rounded-md transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "收起" : `展開其他 ${card.rewardRules.length - 1} 個分類`}
          </button>
        )}

        <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border">
          <span>活動截止：{new Date(card.expiryDate).toLocaleDateString("zh-TW")}</span>
          <span>本月消費 ${totalSpent.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

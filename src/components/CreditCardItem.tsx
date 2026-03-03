import { CreditCard } from "@/types/card";
import { getCardGradient, calculateReward, getRewardProgress, getSpendingProgress, getDaysUntilExpiry, isExpiringSoon, isRewardNearCap } from "@/lib/cardUtils";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CreditCardItemProps {
  card: CreditCard;
  index: number;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
}

export function CreditCardItem({ card, index, onEdit, onDelete }: CreditCardItemProps) {
  const reward = calculateReward(card);
  const rewardProgress = getRewardProgress(card);
  const spendProgress = getSpendingProgress(card);
  const daysLeft = getDaysUntilExpiry(card);
  const expiring = isExpiringSoon(card);
  const nearCap = isRewardNearCap(card);

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
            <p className="text-xs opacity-70">基礎回饋</p>
            <p className="text-lg font-bold">{card.baseReward}%</p>
          </div>
          <div className="text-primary-foreground/40">+</div>
          <div>
            <p className="text-xs opacity-70">加碼回饋</p>
            <p className="text-lg font-bold">{card.bonusReward}%</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs opacity-70">本月回饋</p>
            <p className="text-lg font-bold">${reward.toLocaleString()}</p>
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
          {nearCap && (
            <Badge className="text-xs gap-1 bg-warning text-warning-foreground">
              <AlertTriangle className="h-3 w-3" /> 回饋即將達上限
            </Badge>
          )}
        </div>

        {/* Spending progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">消費進度</span>
            <span className="font-medium">${card.monthlySpent.toLocaleString()} / ${card.spendingThreshold.toLocaleString()}</span>
          </div>
          <Progress value={spendProgress} className="h-2" />
        </div>

        {/* Reward progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">回饋進度</span>
            <span className="font-medium">${reward.toLocaleString()} / ${card.rewardCap.toLocaleString()}</span>
          </div>
          <Progress value={rewardProgress} className="h-2" />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>活動截止：{new Date(card.expiryDate).toLocaleDateString("zh-TW")}</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            總回饋率 {card.baseReward + card.bonusReward}%
          </span>
        </div>
      </div>
    </div>
  );
}

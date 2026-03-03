import { CreditCard as CreditCardIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddCard: () => void;
}

export function EmptyState({ onAddCard }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
        <CreditCardIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold mb-2">尚未新增任何信用卡</h3>
      <p className="text-muted-foreground text-center text-sm mb-6 max-w-xs">
        新增您的第一張信用卡，開始追蹤回饋優惠吧！
      </p>
      <Button onClick={onAddCard} className="gap-2">
        <Plus className="h-4 w-4" /> 新增信用卡
      </Button>
    </div>
  );
}

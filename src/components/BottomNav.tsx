import { LayoutDashboard, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  activeTab: "dashboard" | "cards";
  onTabChange: (tab: "dashboard" | "cards") => void;
  onAddCard: () => void;
}

export function BottomNav({ activeTab, onTabChange, onAddCard }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 pb-safe z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        <button
          onClick={() => onTabChange("dashboard")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "dashboard" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs font-medium">儀表板</span>
        </button>

        <Button
          onClick={onAddCard}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg gradient-gold text-accent-foreground -translate-y-3"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <button
          onClick={() => onTabChange("cards")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "cards" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <CreditCard className="h-5 w-5" />
          <span className="text-xs font-medium">卡片</span>
        </button>
      </div>
    </div>
  );
}

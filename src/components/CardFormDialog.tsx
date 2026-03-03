import { CreditCard, RewardRule, SpendingCategory, SPENDING_CATEGORY_LABELS, createDefaultRule } from "@/types/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard | null;
  onSubmit: (data: Omit<CreditCard, "id">) => void;
}

const ALL_CATEGORIES: SpendingCategory[] = ["domestic", "foreign", "easycard", "special"];

export function CardFormDialog({ open, onOpenChange, card, onSubmit }: CardFormDialogProps) {
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [rules, setRules] = useState<RewardRule[]>([createDefaultRule("domestic")]);

  useEffect(() => {
    if (card) {
      setName(card.name);
      setBank(card.bank);
      setExpiryDate(new Date(card.expiryDate));
      setRules(card.rewardRules.length > 0 ? card.rewardRules : [createDefaultRule("domestic")]);
    } else {
      setName("");
      setBank("");
      setExpiryDate(undefined);
      setRules([createDefaultRule("domestic")]);
    }
  }, [card, open]);

  const usedCategories = rules.map((r) => r.category);
  const availableCategories = ALL_CATEGORIES.filter((c) => !usedCategories.includes(c));

  const addRule = (category: SpendingCategory) => {
    setRules([...rules, createDefaultRule(category)]);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof RewardRule, value: number) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bank || !expiryDate) return;
    onSubmit({
      name,
      bank,
      expiryDate: expiryDate.toISOString(),
      rewardRules: rules,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? "編輯信用卡" : "新增信用卡"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">卡片名稱</label>
            <Input placeholder="例：Line Pay 聯名卡" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">發卡銀行</label>
            <Input placeholder="例：中國信託" value={bank} onChange={(e) => setBank(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">活動截止日期</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !expiryDate && "text-muted-foreground")}>
                  {expiryDate ? format(expiryDate, "yyyy/MM/dd") : <span>選擇日期</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={expiryDate} onSelect={setExpiryDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reward Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold">回饋規則</label>
            </div>

            {rules.map((rule, i) => (
              <div key={rule.category} className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {SPENDING_CATEGORY_LABELS[rule.category]}
                  </Badge>
                  {rules.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRule(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">基礎回饋 %</label>
                    <Input type="number" step="0.1" value={rule.baseReward} onChange={(e) => updateRule(i, "baseReward", +e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">加碼回饋 %</label>
                    <Input type="number" step="0.1" value={rule.bonusReward} onChange={(e) => updateRule(i, "bonusReward", +e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">回饋上限</label>
                    <Input type="number" value={rule.rewardCap} onChange={(e) => updateRule(i, "rewardCap", +e.target.value)} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">消費門檻</label>
                    <Input type="number" value={rule.spendingThreshold} onChange={(e) => updateRule(i, "spendingThreshold", +e.target.value)} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">本月已消費</label>
                  <Input type="number" value={rule.monthlySpent} onChange={(e) => updateRule(i, "monthlySpent", +e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
            ))}

            {availableCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <Button key={cat} type="button" variant="outline" size="sm" className="text-xs gap-1" onClick={() => addRule(cat)}>
                    <Plus className="h-3 w-3" /> {SPENDING_CATEGORY_LABELS[cat]}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
            <Button type="submit" className="flex-1">{card ? "儲存" : "新增"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

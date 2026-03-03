import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard } from "@/types/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const schema = z.object({
  name: z.string().min(1, "請輸入卡片名稱"),
  bank: z.string().min(1, "請輸入發卡銀行"),
  baseReward: z.coerce.number().min(0).max(100),
  bonusReward: z.coerce.number().min(0).max(100),
  rewardCap: z.coerce.number().min(0),
  spendingThreshold: z.coerce.number().min(0),
  expiryDate: z.date({ required_error: "請選擇截止日期" }),
  monthlySpent: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface CardFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard | null;
  onSubmit: (data: Omit<CreditCard, "id">) => void;
}

export function CardFormDialog({ open, onOpenChange, card, onSubmit }: CardFormDialogProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      bank: "",
      baseReward: 0,
      bonusReward: 0,
      rewardCap: 0,
      spendingThreshold: 0,
      monthlySpent: 0,
    },
  });

  useEffect(() => {
    if (card) {
      form.reset({
        name: card.name,
        bank: card.bank,
        baseReward: card.baseReward,
        bonusReward: card.bonusReward,
        rewardCap: card.rewardCap,
        spendingThreshold: card.spendingThreshold,
        expiryDate: new Date(card.expiryDate),
        monthlySpent: card.monthlySpent,
      });
    } else {
      form.reset({
        name: "",
        bank: "",
        baseReward: 0,
        bonusReward: 0,
        rewardCap: 0,
        spendingThreshold: 0,
        monthlySpent: 0,
      });
    }
  }, [card, form, open]);

  const handleSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      bank: data.bank,
      baseReward: data.baseReward,
      bonusReward: data.bonusReward,
      rewardCap: data.rewardCap,
      spendingThreshold: data.spendingThreshold,
      monthlySpent: data.monthlySpent,
      expiryDate: data.expiryDate.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? "編輯信用卡" : "新增信用卡"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>卡片名稱</FormLabel>
                <FormControl><Input placeholder="例：Line Pay 聯名卡" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bank" render={({ field }) => (
              <FormItem>
                <FormLabel>發卡銀行</FormLabel>
                <FormControl><Input placeholder="例：中國信託" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="baseReward" render={({ field }) => (
                <FormItem>
                  <FormLabel>基礎回饋 %</FormLabel>
                  <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bonusReward" render={({ field }) => (
                <FormItem>
                  <FormLabel>加碼回饋 %</FormLabel>
                  <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="rewardCap" render={({ field }) => (
                <FormItem>
                  <FormLabel>回饋上限</FormLabel>
                  <FormControl><Input type="number" placeholder="$" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="spendingThreshold" render={({ field }) => (
                <FormItem>
                  <FormLabel>消費門檻</FormLabel>
                  <FormControl><Input type="number" placeholder="$" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="monthlySpent" render={({ field }) => (
              <FormItem>
                <FormLabel>本月已消費金額</FormLabel>
                <FormControl><Input type="number" placeholder="$" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>活動截止日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "yyyy/MM/dd") : <span>選擇日期</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>取消</Button>
              <Button type="submit" className="flex-1">{card ? "儲存" : "新增"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

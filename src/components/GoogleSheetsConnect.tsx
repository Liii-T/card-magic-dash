import { useState } from "react";
import { GoogleSheetConfig } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings2, FileSpreadsheet, Link2, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "google-sheet-config";

function loadConfig(): GoogleSheetConfig | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function GoogleSheetsConnect() {
  const [config, setConfig] = useState<GoogleSheetConfig | null>(loadConfig);
  const [step, setStep] = useState<"connect" | "inputUrl" | "done">(
    config?.connected ? "done" : "connect"
  );
  const [gasUrl, setGasUrl] = useState(""); // 用戶貼上的 GAS 網址
  const [syncing, setSyncing] = useState(false);

  // 預設欄位對應（對齊你的 GAS 腳本）
  const [mapping] = useState({
    date: "A",
    amount: "B",
    type: "C",
    paymentTool: "D", 
    cardName: "E",
  });

  const handleStartConnect = () => {
    setStep("inputUrl");
  };

  const handleSaveAndFinish = () => {
    if (!gasUrl.startsWith("https://script.google.com")) {
      toast.error("請輸入有效的 Google Apps Script 網址");
      return;
    }

    const newConfig: GoogleSheetConfig = {
      sheetId: "GAS_CONNECTED", // 標記為 GAS 連線
      sheetName: "雲端記帳表",
      columnMapping: mapping,
      syncFrequency: "manual",
      connected: true,
      lastSyncAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    localStorage.setItem("gas-url-link", gasUrl); // 額外存下網址
    setConfig(newConfig);
    setStep("done");
    toast.success("連線設定完成！");
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const savedUrl = localStorage.getItem("gas-url-link");
      if (!savedUrl) throw new Error("找不到連線網址");

      const response = await fetch(savedUrl);
      const data = await response.json();
      
      console.log("從試算表抓到的資料：", data);

      // 存入 LocalStorage 供 Dashboard 使用
      localStorage.setItem("raw-spending-data", JSON.stringify(data));
      
      if (config) {
        const updated = { ...config, lastSyncAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setConfig(updated);
      }
      
      toast.success(`同步完成！已匯入 ${data.length} 筆紀錄`);
    } catch (error) {
      console.error("同步失敗:", error);
      toast.error("同步失敗，請確認網址正確且權限已設為『任何人』");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("gas-url-link");
    setConfig(null);
    setStep("connect");
    setGasUrl("");
    toast.success("已中斷連線");
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* 標題欄 */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/15 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-success" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Google Sheets 自動同步</h2>
            <p className="text-xs text-muted-foreground">免手動輸入，一鍵更新消費資料</p>
          </div>
          {config?.connected && (
            <Badge className="ml-auto bg-success/15 text-success text-xs">
              已連線
            </Badge>
          )}
        </div>
      </div>

      {/* 步驟 1: 開始連線 */}
      {step === "connect" && (
        <div className="bg-card rounded-xl p-8 text-center border border-border space-y-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Link2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">連線到雲端記帳表</h3>
          <p className="text-sm text-muted-foreground">請先確認您已依照教學完成 Google Apps Script 部署</p>
          <Button onClick={handleStartConnect} className="w-full gap-2">
            開始設定 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 步驟 2: 輸入網址 (簡化版) */}
      {step === "inputUrl" && (
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">貼上您的同步網址 (GAS URL)</label>
            <Input
              placeholder="https://script.google.com/macros/s/..."
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground italic">* 此網址將安全地儲存在您的手機本地空間</p>
          </div>
          <Button onClick={handleSaveAndFinish} className="w-full">完成連線</Button>
          <Button variant="ghost" onClick={() => setStep("connect")} className="w-full text-xs">返回上一步</Button>
        </div>
      )}

      {/* 步驟 3: 管理介面 */}
      {step === "done" && config && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4" /> 連線狀態
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">同步模式</span>
                <span className="font-medium text-success">雲端自動對應 (A-E欄)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">上次同步</span>
                <span className="text-xs">
                  {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString("zh-TW") : "尚未同步"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSync} className="flex-1 gap-2 h-12 text-lg" disabled={syncing}>
              <RefreshCw className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "同步中..." : "立即同步資料"}
            </Button>
            <Button variant="outline" onClick={handleDisconnect} className="text-destructive h-12">
              中斷
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { GoogleSheetConfig } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Link2, RefreshCw, CheckCircle2, AlertCircle, Settings2, ArrowRight } from "lucide-react";
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

function saveConfig(config: GoogleSheetConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function GoogleSheetsConnect() {
  const [config, setConfig] = useState<GoogleSheetConfig | null>(loadConfig);
  const [step, setStep] = useState<"connect" | "done">(
    config?.connected ? "done" : "connect"
  );
  const [sheetUrl, setSheetUrl] = useState("");
  const [syncing, setSyncing] = useState(false);

  // Column mapping state
  const [mapping, setMapping] = useState({
    date: "A",
    amount: "B",
    type: "C",
    cardName: "D",
  });
  const [syncFrequency, setSyncFrequency] = useState<"manual" | "daily" | "hourly">("daily");

  const handleGoogleConnect = () => {
    // Simulate OAuth flow
    toast.info("Google OAuth 連線需要後端服務（Lovable Cloud）才能實際運作。目前為 UI 展示模式。");
    setStep("select");
  };

  const handleSheetSelect = () => {
    if (!sheetUrl) {
      toast.error("請輸入 Google Sheet 連結");
      return;
    }
    // Extract sheet ID from URL
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      toast.error("無法解析 Google Sheet 連結，請確認格式正確");
      return;
    }
    setStep("mapping");
  };

  const handleMappingConfirm = () => {
    setStep("sync");
  };

  const handleFinish = () => {
    const newConfig: GoogleSheetConfig = {
      sheetId: sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1] || "",
      sheetName: "消費記錄",
      columnMapping: mapping,
      syncFrequency,
      connected: true,
      lastSyncAt: new Date().toISOString(),
    };
    saveConfig(newConfig);
    setConfig(newConfig);
    setStep("done");
    toast.success("Google Sheet 連線設定完成！");
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // 這裡請填入你剛才部署 Google Apps Script 後得到的「網頁應用程式網址」
      const GAS_URL = "你的_GAS_網頁應用程式網址"; 
      
      // 真正去抓資料
      const response = await fetch(GAS_URL);
      const data = await response.json();
      
      console.log("從試算表抓到的資料：", data);
  
      // 把抓到的資料存進手機的儲存空間 (LocalStorage)
      // 這樣 Dashboard 才能讀到這些真實的消費紀錄
      localStorage.setItem("raw-spending-data", JSON.stringify(data));
      
      // 更新連線狀態與最後同步時間
      if (config) {
        const updated = { ...config, lastSyncAt: new Date().toISOString() };
        // 這邊呼叫原有的存檔功能
        localStorage.setItem("google-sheet-config", JSON.stringify(updated));
        setConfig(updated);
      }
      
      toast.success(`同步完成！已成功匯入 ${data.length} 筆資料`);
    } catch (error) {
      console.error("同步失敗:", error);
      toast.error("同步失敗，請檢查網路，或確認 GAS 網址是否正確並設定為『任何人』存取");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(null);
    setStep("connect");
    setSheetUrl("");
    toast.success("已中斷 Google Sheet 連線");
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-success/15 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-success" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Google Sheets 連線</h2>
            <p className="text-xs text-muted-foreground">串接記帳表自動同步消費資料</p>
          </div>
          {config?.connected && (
            <Badge className="ml-auto bg-success/15 text-success text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" /> 已連線
            </Badge>
          )}
        </div>
      </div>

      {/* Step: Connect Google Account */}
      {step === "connect" && (
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold">連接 Google 帳號</h3>
            <p className="text-sm text-muted-foreground">授權存取您的 Google Sheets 以自動匯入消費紀錄</p>
          </div>
          <Button onClick={handleGoogleConnect} className="w-full gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            使用 Google 帳號登入
          </Button>
        </div>
      )}

      {/* Step: Select Sheet */}
      {step === "select" && (
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
            選擇 Google Sheet
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">貼上 Google Sheet 連結</label>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleSheetSelect} className="w-full gap-2">
            下一步 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step: Column Mapping */}
      {step === "mapping" && (
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
            欄位對應設定
          </div>
          <p className="text-xs text-muted-foreground">指定 Google Sheet 中各欄位對應的資料</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "date" as const, label: "消費日期", placeholder: "例：A" },
              { key: "amount" as const, label: "消費金額", placeholder: "例：B" },
              { key: "type" as const, label: "消費類型", placeholder: "例：C" },
              { key: "cardName" as const, label: "信用卡名稱", placeholder: "例：D" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <Input
                  value={mapping[key]}
                  onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-1 text-xs font-medium">
              <AlertCircle className="h-3 w-3 text-info" /> 消費類型對應
            </div>
            <p className="text-xs text-muted-foreground">
              系統會自動辨識：「國內」→ 國內消費、「國外」→ 國外消費、「悠遊卡」→ 悠遊卡儲值、其他 → 指定通路加碼
            </p>
          </div>

          <Button onClick={handleMappingConfirm} className="w-full gap-2">
            下一步 <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step: Sync Settings */}
      {step === "sync" && (
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
            同步頻率設定
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">自動同步頻率</label>
            <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">手動同步</SelectItem>
                <SelectItem value="daily">每日自動同步</SelectItem>
                <SelectItem value="hourly">每小時自動同步</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleFinish} className="w-full gap-2">
            <CheckCircle2 className="h-4 w-4" /> 完成設定
          </Button>
        </div>
      )}

      {/* Step: Done / Management */}
      {step === "done" && config && (
        <>
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4" /> 連線資訊
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sheet ID</span>
                <span className="font-mono text-xs truncate max-w-[180px]">{config.sheetId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">同步頻率</span>
                <span className="font-medium">
                  {config.syncFrequency === "manual" ? "手動" : config.syncFrequency === "daily" ? "每日" : "每小時"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">欄位對應</span>
                <span className="text-xs">
                  日期:{config.columnMapping.date} 金額:{config.columnMapping.amount} 類型:{config.columnMapping.type} 卡名:{config.columnMapping.cardName}
                </span>
              </div>
              {config.lastSyncAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">上次同步</span>
                  <span className="text-xs">{new Date(config.lastSyncAt).toLocaleString("zh-TW")}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSync} className="flex-1 gap-2" disabled={syncing}>
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "同步中..." : "手動同步"}
            </Button>
            <Button variant="outline" onClick={handleDisconnect} className="text-destructive">
              中斷連線
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

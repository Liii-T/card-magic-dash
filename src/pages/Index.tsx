import { useState } from "react";
import { useCards } from "@/hooks/useCards";
import { CreditCard } from "@/types/card";
import { DashboardStats } from "@/components/DashboardStats";
import { CreditCardItem } from "@/components/CreditCardItem";
import { CardFormDialog } from "@/components/CardFormDialog";
import { EmptyState } from "@/components/EmptyState";
import { BottomNav } from "@/components/BottomNav";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Index = () => {
  const { cards, addCard, updateCard, deleteCard } = useCards();
  const [activeTab, setActiveTab] = useState<"dashboard" | "cards">("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<CreditCard, "id">) => {
    if (editingCard) {
      updateCard(editingCard.id, data);
    } else {
      addCard(data);
    }
    setEditingCard(null);
  };

  const handleAddCard = () => {
    setEditingCard(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteCard(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">
            {activeTab === "dashboard" ? "💳 回饋總覽" : "💳 我的卡片"}
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {activeTab === "dashboard" ? (
          cards.length === 0 ? (
            <EmptyState onAddCard={handleAddCard} />
          ) : (
            <DashboardStats cards={cards} />
          )
        ) : (
          cards.length === 0 ? (
            <EmptyState onAddCard={handleAddCard} />
          ) : (
            <div className="space-y-4">
              {cards.map((card, i) => (
                <CreditCardItem
                  key={card.id}
                  card={card}
                  index={i}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          )
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onAddCard={handleAddCard} />

      <CardFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCard(null);
        }}
        card={editingCard}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>確定要刪除這張信用卡嗎？此操作無法復原。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;

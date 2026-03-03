import { useState, useCallback } from "react";
import { CreditCard } from "@/types/card";

const STORAGE_KEY = "credit-cards";

function loadCards(): CreditCard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: CreditCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useCards() {
  const [cards, setCards] = useState<CreditCard[]>(loadCards);

  const addCard = useCallback((card: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = { ...card, id: crypto.randomUUID() };
    setCards((prev) => {
      const next = [...prev, newCard];
      saveCards(next);
      return next;
    });
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveCards(next);
      return next;
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCards(next);
      return next;
    });
  }, []);

  return { cards, addCard, updateCard, deleteCard };
}

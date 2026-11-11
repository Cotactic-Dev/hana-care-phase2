import type { CartItem, CartTotals } from "@/data/pricing";

export type PaymentMethod = "card" | "promptpay" | "transfer";

export interface MockOrder {
  no: string;
  createdAt: string;
  items: CartItem[];
  totals: CartTotals;
  payment: PaymentMethod;
  needsApproval: boolean;
  /** Only what the confirmation page displays — no phone/address kept (PDPA). */
  customer: { name: string; company?: string; province: string; deliveryDate?: string };
}

const KEY = "hana_last_order";

export function saveOrder(o: Omit<MockOrder, "no" | "createdAt">): MockOrder {
  const order: MockOrder = { ...o, no: String(1000 + Math.floor(Math.random() * 9000)), createdAt: new Date().toISOString() };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {}
  return order;
}

export function loadOrder(): MockOrder | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MockOrder) : null;
  } catch {
    return null;
  }
}

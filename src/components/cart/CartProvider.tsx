"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type PlanId, type ProductSlug } from "@/data/products";
import { MAX_QTY, cartItemId, cartTotals, quote, type CartItem, type CartTotals } from "@/data/pricing";
import { trackEvent } from "@/lib/analytics";
import CartDrawer from "./CartDrawer";

const STORAGE_KEY = "hana_cart_v1";

type Ctx = {
  items: CartItem[];
  totals: CartTotals;
  hydrated: boolean;
  add: (slug: ProductSlug, plan: PlanId, months: number, qty?: number, opts?: { openDrawer?: boolean }) => void;
  update: (id: string, patch: Partial<Pick<CartItem, "plan" | "months" | "qty">>) => void;
  remove: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (o: boolean) => void;
};

const CartContext = createContext<Ctx | null>(null);

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n) || 1));

/** Merge lines that end up with the same model/plan/term. */
function normalize(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const it of items) {
    const id = cartItemId(it.slug, it.plan, it.months);
    const prev = map.get(id);
    map.set(id, { ...it, id, qty: clampQty((prev?.qty ?? 0) + it.qty) });
  }
  return [...map.values()];
}

function ga4Item(it: CartItem) {
  const p = getProduct(it.slug)!;
  const q = quote(p, it.plan, it.months, it.qty);
  return { item_id: p.sku, item_name: p.modelName, item_variant: `${it.plan}_${it.months}m`, price: q.monthly, quantity: it.qty };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(normalize((JSON.parse(raw) as CartItem[]).filter((i) => getProduct(i.slug))));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const add: Ctx["add"] = useCallback((slug, plan, months, qty = 1, opts) => {
    const item: CartItem = { id: cartItemId(slug, plan, months), slug, plan, months, qty: clampQty(qty) };
    setItems((prev) => normalize([...prev, item]));
    const p = getProduct(slug)!;
    const q = quote(p, plan, months, qty);
    trackEvent("add_to_cart", { currency: "THB", value: q.monthlyTotal, items: [ga4Item(item)] });
    if (opts?.openDrawer !== false) setDrawerOpen(true);
  }, []);

  const update: Ctx["update"] = useCallback((id, patch) => {
    setItems((prev) => normalize(prev.map((it) => (it.id === id ? { ...it, ...patch, qty: clampQty(patch.qty ?? it.qty) } : it))));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it) trackEvent("remove_from_cart", { currency: "THB", items: [ga4Item(it)] });
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => cartTotals(items), [items]);

  return (
    <CartContext.Provider value={{ items, totals, hydrated, add, update, remove, clear, drawerOpen, setDrawerOpen }}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export { ga4Item };

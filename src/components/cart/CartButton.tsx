"use client";

import Icon from "@/components/ui/Icon";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { totals, hydrated, setDrawerOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-hana-navy transition hover:bg-hana-navy-tint"
      aria-label={`ตะกร้าเช่าเตียง (${totals.count} รายการ)`}
    >
      <Icon name="cart" />
      {hydrated && totals.count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-hana-pink-ink px-1 text-[0.7rem] font-bold text-white">
          {totals.count}
        </span>
      )}
    </button>
  );
}

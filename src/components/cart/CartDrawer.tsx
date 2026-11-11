"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { formatTHB } from "@/data/products";
import { useCart } from "./CartProvider";
import CartLine from "./CartLine";

export default function CartDrawer() {
  const { items, totals, drawerOpen, setDrawerOpen } = useCart();
  const pathname = usePathname();

  useEffect(() => setDrawerOpen(false), [pathname, setDrawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <div className={`fixed inset-0 z-[1000] ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        className={`absolute inset-0 bg-hana-midnight/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าเช่าเตียง"
        className={`absolute top-0 right-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-card-lg transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-warm-border px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-hana-navy">
            <Icon name="cart" /> ตะกร้าเช่าเตียง <span className="text-sm font-medium text-ink-light">({totals.count})</span>
          </h2>
          <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-full p-2 text-ink-muted hover:bg-warm-bg" aria-label="ปิด">
            <Icon name="close" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-ink-muted">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-hana-navy-tint text-2xl text-hana-navy">
              <Icon name="cart" />
            </div>
            ยังไม่มีเตียงในตะกร้า
            <Link href="/patient-beds/" className="btn btn-primary btn-sm">
              เลือกเตียงปรับระดับ
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {items.map((it) => (
                <CartLine key={it.id} item={it} compact />
              ))}
            </div>
            <div className="border-t border-warm-border bg-warm-bg px-6 py-5">
              <div className="flex justify-between text-sm text-ink-muted">
                <span>ค่าเช่ารวมต่อเดือน</span>
                <strong className="text-ink">{formatTHB(totals.monthlyTotal)}</strong>
              </div>
              {totals.savings > 0 && (
                <div className="mt-1 flex justify-between text-sm text-hana-pink-ink">
                  <span>ประหยัดตลอดสัญญา</span>
                  <strong>-{formatTHB(totals.savings)}</strong>
                </div>
              )}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-semibold text-hana-navy">ชำระวันแรก</span>
                <span className="text-2xl font-bold text-hana-navy">{formatTHB(totals.dueToday)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <Link href="/cart/" className="btn btn-secondary btn-sm">
                  ดูตะกร้า / แก้ไข
                </Link>
                <Link href="/checkout/" className="btn btn-primary btn-sm">
                  ชำระเงิน →
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

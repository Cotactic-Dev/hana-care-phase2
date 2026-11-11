"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatTHB } from "@/data/products";
import { useCart } from "./CartProvider";
import CartLine from "./CartLine";

export default function CartView() {
  const { items, totals, hydrated, clear } = useCart();

  if (!hydrated) return <div className="h-64 animate-pulse rounded-[var(--radius-md)] bg-warm-bg" />;

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-warm-border bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-hana-navy-tint text-2xl text-hana-navy">
          <Icon name="cart" />
        </div>
        <h2 className="text-xl font-bold text-hana-navy">ยังไม่มีเตียงในตะกร้า</h2>
        <p className="mt-2 text-ink-muted">เลือกรุ่นเตียงและแพ็กเกจที่เหมาะกับคุณ แล้วสั่งเช่าออนไลน์ได้ทันที</p>
        <Link href="/patient-beds/" className="btn btn-primary mt-6">
          เลือกเตียงปรับระดับ →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-[var(--radius-md)] border border-warm-border bg-white px-5 shadow-card sm:px-6">
        {items.map((it) => (
          <CartLine key={it.id} item={it} />
        ))}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-border py-4 text-sm">
          <Link href="/patient-beds/" className="text-hana-navy hover:underline">
            ← เลือกเตียงเพิ่ม
          </Link>
          <button type="button" onClick={clear} className="text-ink-light hover:text-hana-pink-ink">
            ล้างตะกร้า
          </button>
        </div>
      </div>

      <aside className="rounded-[var(--radius-md)] border border-warm-border bg-white p-6 shadow-card lg:sticky lg:top-28">
        <h2 className="mb-4 text-lg font-bold text-hana-navy">สรุปยอด</h2>
        <dl className="space-y-2 text-sm">
          <Row k={`จำนวนเตียง`} v={`${totals.count} เตียง`} />
          <Row k="ค่าเช่ารวมต่อเดือน" v={formatTHB(totals.monthlyTotal)} />
          <Row k="มูลค่าสัญญารวม" v={formatTHB(totals.contractTotal)} />
          {totals.savings > 0 && <Row k="ส่วนลดสัญญาระยะยาว" v={`-${formatTHB(totals.savings)}`} accent />}
          {totals.deposit > 0 && <Row k="เงินประกัน (คืนเมื่อจบสัญญา)" v={formatTHB(totals.deposit)} />}
          <Row k="ค่าจัดส่งและติดตั้ง" v="ฟรี" />
        </dl>
        <div className="mt-4 flex items-baseline justify-between border-t border-warm-border pt-4">
          <span className="font-semibold text-hana-navy">ชำระวันแรก</span>
          <span className="text-2xl font-bold text-hana-navy">{formatTHB(totals.dueToday)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-light">หลังจากนั้นชำระ {formatTHB(totals.monthlyTotal)} / เดือน ตามระยะสัญญา</p>
        <Link href="/checkout/" className="btn btn-primary btn-lg mt-5 w-full">
          <Icon name="lock" className="inline-icon" /> ดำเนินการชำระเงิน
        </Link>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[0.7rem] text-ink-light">
          <span className="flex flex-col items-center gap-1"><Icon name="truck" className="text-lg text-hana-purple" />ส่งฟรีถึงห้องนอน</span>
          <span className="flex flex-col items-center gap-1"><Icon name="wrench" className="text-lg text-hana-purple" />ซ่อมบำรุงตลอดสัญญา</span>
          <span className="flex flex-col items-center gap-1"><Icon name="shield" className="text-lg text-hana-purple" />ขึ้นทะเบียน อย.</span>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${accent ? "text-hana-pink-ink" : "text-ink-muted"}`}>
      <dt>{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

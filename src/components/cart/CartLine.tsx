"use client";

import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { formatTHB, getPlan, getProduct } from "@/data/products";
import { MAX_QTY, formatTerm, pct, quote, type CartItem } from "@/data/pricing";
import { useCart } from "./CartProvider";

/** One cart row. `compact` = drawer (read-mostly), otherwise full editor for /cart/. */
export default function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const { update, remove } = useCart();
  const p = getProduct(item.slug);
  if (!p) return null;
  const q = quote(p, item.plan, item.months, item.qty);
  const plan = getPlan(item.plan);

  return (
    <div className="flex gap-4 border-b border-warm-border py-5 last:border-b-0">
      <Link
        href={`/patient-beds/${p.slug}/`}
        className={`shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[#f2f2f4] ${compact ? "h-20 w-24" : "h-24 w-28 sm:h-28 sm:w-36"}`}
      >
        <Image src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} sizes="150px" className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/patient-beds/${p.slug}/`} className="font-semibold text-hana-navy hover:underline">
              เตียงปรับระดับ รุ่น {p.modelName}
            </Link>
            <div className="text-xs text-ink-light">SKU {p.sku}</div>
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="shrink-0 rounded-full p-1.5 text-ink-light transition hover:bg-hana-pink-tint hover:text-hana-pink-ink"
            aria-label={`ลบ ${p.modelName} ออกจากตะกร้า`}
          >
            <Icon name="trash" />
          </button>
        </div>

        {compact ? (
          <div className="mt-1 text-sm text-ink-muted">
            {plan.name} · {formatTerm(item.months)} · x{item.qty}
          </div>
        ) : (
          // WooCommerce cart can't switch variations in place → show the choice + "edit" link to the product page
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
              <dt className="text-ink-light">รูปแบบบริการ:</dt>
              <dd className="text-ink">{plan.name}</dd>
              <dt className="text-ink-light">ระยะสัญญา:</dt>
              <dd className="text-ink">
                {formatTerm(item.months)}{" "}
                <Link href={`/patient-beds/${p.slug}/?plan=${item.plan}&months=${item.months}#rent`} className="ml-1 text-xs text-hana-blue underline">
                  แก้ไข
                </Link>
              </dd>
            </dl>
            <QtyStepper value={item.qty} onChange={(qty) => update(item.id, { qty })} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          <div className="text-sm">
            {q.discount > 0 && (
              <span className="mr-2 inline-flex items-center gap-1 rounded-full bg-hana-pink-tint px-2 py-0.5 text-xs font-semibold text-hana-pink-ink">
                <Icon name="percent" /> ลด {pct(q.discount)}
              </span>
            )}
            {q.discount > 0 && <span className="mr-1.5 text-ink-light line-through">{formatTHB(q.baseMonthly)}</span>}
            <span className="font-semibold text-ink">{formatTHB(q.monthly)}</span>
            <span className="text-ink-light"> / เดือน / เตียง</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-hana-navy">
              {formatTHB(q.monthlyTotal)}
              <span className="text-sm font-medium text-ink-muted"> / เดือน</span>
            </div>
            {!compact && <div className="text-xs text-ink-light">รวมตลอดสัญญา {formatTHB(q.contractTotal)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-1 inline-flex h-[42px] items-center overflow-hidden rounded-[var(--radius-sm)] border border-warm-border bg-white">
      <button type="button" className="grid h-full w-10 place-items-center text-hana-navy disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="ลดจำนวน">
        <Icon name="minus" />
      </button>
      <span className="w-8 text-center font-semibold text-ink" aria-live="polite">
        {value}
      </span>
      <button type="button" className="grid h-full w-10 place-items-center text-hana-navy disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="เพิ่มจำนวน">
        <Icon name="plus" />
      </button>
    </div>
  );
}

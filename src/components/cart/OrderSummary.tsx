import Image from "next/image";
import { formatTHB, getPlan, getProduct } from "@/data/products";
import { formatTerm, pct, quote, type CartItem, type CartTotals } from "@/data/pricing";

/** Read-only order summary (checkout sidebar + order-complete page). */
export default function OrderSummary({ items, totals, title = "สรุปคำสั่งเช่า" }: { items: CartItem[]; totals: CartTotals; title?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-warm-border bg-white p-6 shadow-card">
      <h2 className="mb-4 text-lg font-bold text-hana-navy">{title}</h2>
      <ul className="space-y-4">
        {items.map((it) => {
          const p = getProduct(it.slug);
          if (!p) return null;
          const q = quote(p, it.plan, it.months, it.qty);
          return (
            <li key={it.id} className="flex gap-3">
              <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[var(--radius-xs)] bg-[#f2f2f4]">
                <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="80px" className="h-full w-full object-cover" />
                <span className="absolute top-1 right-1 grid h-5 min-w-5 place-items-center rounded-full bg-hana-navy px-1 text-[0.65rem] font-bold text-white">
                  {it.qty}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold text-ink">รุ่น {p.modelName}</div>
                <div className="text-ink-light">
                  {getPlan(it.plan).name} · {formatTerm(it.months)}
                </div>
                {q.discount > 0 && <div className="text-xs font-semibold text-hana-pink-ink">ส่วนลดสัญญายาว {pct(q.discount)}</div>}
              </div>
              <div className="shrink-0 text-right text-sm">
                <div className="font-semibold text-ink">{formatTHB(q.monthlyTotal)}</div>
                <div className="text-xs text-ink-light">/ เดือน</div>
              </div>
            </li>
          );
        })}
      </ul>

      <dl className="mt-5 space-y-2 border-t border-warm-border pt-4 text-sm">
        <SumRow k="ค่าเช่ารวมต่อเดือน" v={formatTHB(totals.monthlyTotal)} />
        <SumRow k="มูลค่าสัญญารวม" v={formatTHB(totals.contractTotal)} />
        {totals.savings > 0 && <SumRow k="ส่วนลดสัญญาระยะยาว" v={`-${formatTHB(totals.savings)}`} accent />}
        {totals.deposit > 0 && <SumRow k="เงินประกัน (คืนเมื่อจบสัญญา)" v={formatTHB(totals.deposit)} />}
        <SumRow k="ค่าจัดส่ง ติดตั้ง สาธิตการใช้งาน" v="ฟรี" />
      </dl>
      <div className="mt-4 flex items-baseline justify-between rounded-[var(--radius-sm)] bg-hana-navy-tint px-4 py-3">
        <span className="font-semibold text-hana-navy">
          ชำระวันแรก
          <span className="block text-xs font-normal text-ink-light">{totals.deposit > 0 ? "ค่าเช่าเดือนแรก + เงินประกัน" : "ค่าเช่าเดือนแรก"}</span>
        </span>
        <span className="text-2xl font-bold text-hana-navy">{formatTHB(totals.dueToday)}</span>
      </div>
    </div>
  );
}

function SumRow({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${accent ? "text-hana-pink-ink" : "text-ink-muted"}`}>
      <dt>{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}

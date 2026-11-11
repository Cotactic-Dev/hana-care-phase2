"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import SampleBadge from "@/components/ui/SampleBadge";
import { formatTHB, getProduct, rentalPlans, type PlanId, type ProductSlug } from "@/data/products";
import { defaultMonths, depositMonths, formatTerm, maxDiscount, pct, quote, termOptions } from "@/data/pricing";
import { contact } from "@/data/site";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./CartLine";
import { SELECT_PLAN_EVENT } from "./SelectPlanButton";

/** Product page: pick plan → contract length → qty, then add to cart / rent now. */
export default function RentalConfigurator({ slug }: { slug: ProductSlug }) {
  const p = getProduct(slug)!;
  const router = useRouter();
  const { add } = useCart();
  const [plan, setPlan] = useState<PlanId>("short");
  const [months, setMonths] = useState(defaultMonths("short"));
  const [qty, setQty] = useState(1);

  // Deep link from plan cards / quiz: ?plan=lease&months=24
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const qp = qs.get("plan") as PlanId | null;
    if (qp && termOptions[qp]) {
      setPlan(qp);
      const qm = Number(qs.get("months"));
      setMonths(termOptions[qp].some((t) => t.months === qm) ? qm : defaultMonths(qp));
    }
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<{ plan: PlanId }>).detail.plan;
      setPlan(id);
      setMonths(defaultMonths(id));
    };
    window.addEventListener(SELECT_PLAN_EVENT, onSelect);
    return () => window.removeEventListener(SELECT_PLAN_EVENT, onSelect);
  }, []);

  const choosePlan = (id: PlanId) => {
    setPlan(id);
    setMonths(defaultMonths(id));
  };

  const q = quote(p, plan, months, qty);

  return (
    <div id="rent" className="scroll-mt-28 rounded-[var(--radius-md)] border border-warm-border bg-white p-5 shadow-card sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-hana-navy">1. เลือกรูปแบบบริการ</h2>
        <SampleBadge />
      </div>
      <div className="grid gap-2.5" role="radiogroup" aria-label="รูปแบบบริการ">
        {rentalPlans.map((r) => {
          const active = r.id === plan;
          const md = maxDiscount(r.id);
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choosePlan(r.id)}
              className={`flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border-2 px-4 py-3 text-left transition ${
                active ? "border-hana-navy bg-hana-navy-tint" : "border-warm-border hover:border-hana-purple/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-hana-navy" : "border-warm-border"}`}>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-hana-navy" />}
                </span>
                <span>
                  <span className="block font-semibold text-ink">
                    {r.name} {r.popular && <span className="ml-1 rounded-full bg-hana-gradient px-2 py-0.5 text-[0.65rem] text-white">บริการหลัก</span>}
                  </span>
                  <span className="block text-xs text-ink-light">
                    สัญญา {r.term}
                    {md > 0 && <span className="text-hana-pink-ink"> · ลดสูงสุด {pct(md)}</span>}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs text-ink-light">เริ่มต้น</span>
                <span className="font-bold text-hana-navy">{formatTHB(p.monthly[r.id])}</span>
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-6 mb-3 text-base font-bold text-hana-navy">2. เลือกระยะสัญญา</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="ระยะสัญญา">
        {termOptions[plan].map((t) => {
          const active = t.months === months;
          return (
            <button
              key={t.months}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMonths(t.months)}
              className={`relative min-w-[88px] rounded-[var(--radius-sm)] border-2 px-4 pt-2.5 pb-2 text-center transition ${
                active ? "border-hana-navy bg-hana-navy text-white" : "border-warm-border bg-white text-ink hover:border-hana-purple/50"
              }`}
            >
              <span className="block font-semibold">{formatTerm(t.months).replace(/ \(.*\)/, "")}</span>
              <span className={`block text-[0.7rem] ${active ? "text-white/80" : "text-ink-light"}`}>
                {t.discount > 0 ? `ลด ${pct(t.discount)}` : "ราคาปกติ"}
              </span>
              {t.discount > 0 && t.discount === maxDiscount(plan) && (
                <span className="absolute -top-2.5 -right-2 rounded-full bg-hana-pink-ink px-1.5 py-0.5 text-[0.6rem] font-bold text-white">คุ้มสุด</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-1 text-base font-bold text-hana-navy">3. จำนวนเตียง</h2>
          <QtyStepper value={qty} onChange={setQty} />
        </div>
        <div className="text-right">
          {q.discount > 0 && (
            <div className="text-sm text-ink-light">
              <span className="line-through">{formatTHB(q.baseMonthly)}</span>{" "}
              <span className="font-semibold text-hana-pink-ink">-{pct(q.discount)}</span>
            </div>
          )}
          <div className="text-3xl font-bold text-hana-navy">
            {formatTHB(q.monthly)}
            <span className="text-base font-medium text-ink-muted"> / เดือน</span>
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 rounded-[var(--radius-sm)] bg-warm-bg p-4 text-sm">
        <Row k={`ค่าเช่า ${formatTerm(months)} x ${qty} เตียง`} v={formatTHB(q.contractTotal)} />
        {q.savings > 0 && <Row k="ส่วนลดสัญญาระยะยาว" v={`-${formatTHB(q.savings)}`} accent />}
        {q.deposit > 0 && <Row k={`เงินประกัน (คืนเมื่อจบสัญญา, ${depositMonths[plan]} เดือน)`} v={formatTHB(q.deposit)} />}
        <Row k="ค่าจัดส่ง ติดตั้ง และสาธิตการใช้งาน" v="ฟรี" />
        <div className="flex justify-between border-t border-warm-border pt-2 font-semibold text-hana-navy">
          <dt>ชำระวันแรก</dt>
          <dd>{formatTHB(q.dueToday)}</dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => add(slug, plan, months, qty)}>
          <Icon name="cart" className="inline-icon" /> เพิ่มลงตะกร้า
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => {
            add(slug, plan, months, qty, { openDrawer: false });
            router.push("/checkout/");
          }}
        >
          เช่าเลย →
        </button>
      </div>
      <a
        href={contact.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-line-dark"
        data-track="click_line"
        data-track-params={JSON.stringify({ model: slug, placement: "configurator" })}
      >
        <Icon name="chat" /> ยังไม่แน่ใจ? สอบถามทาง LINE {contact.lineId}
      </a>
    </div>
  );
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${accent ? "text-hana-pink-ink" : "text-ink-muted"}`}>
      <dt>{k}</dt>
      <dd className="shrink-0 font-medium">{v}</dd>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useUI } from "@/components/ui/UIProvider";
import { formatTHB } from "@/data/products";
import { trackEvent } from "@/lib/analytics";
import { ga4Item, useCart } from "./CartProvider";
import OrderSummary from "./OrderSummary";
import { saveOrder, type PaymentMethod } from "./order";
import { TH_STATES } from "@/data/th-provinces";

const PAYMENTS: { id: PaymentMethod; icon: IconName; title: string; desc: string }[] = [
  { id: "card", icon: "card", title: "บัตรเครดิต / เดบิต", desc: "ตัดค่าเช่ารายเดือนอัตโนมัติ Visa, Mastercard, JCB" },
  { id: "promptpay", icon: "qr", title: "พร้อมเพย์ QR", desc: "สแกนจ่ายงวดแรก งวดถัดไปส่ง QR ทาง LINE / SMS" },
  { id: "transfer", icon: "bank", title: "โอนผ่านบัญชีธนาคาร", desc: "แนบสลิปภายใน 24 ชม. เหมาะกับองค์กร / ออกใบกำกับภาษี" },
];

export default function CheckoutForm() {
  const router = useRouter();
  const { showToast } = useUI();
  const { items, totals, hydrated, clear } = useCart();
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  const needsApproval = items.some((i) => i.plan !== "short");

  if (!hydrated) return <div className="h-96 animate-pulse rounded-[var(--radius-md)] bg-warm-bg" />;

  if (items.length === 0 && !submitting) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-warm-border bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-hana-navy">ตะกร้าของคุณว่างอยู่</h2>
        <Link href="/patient-beds/" className="btn btn-primary mt-6">
          เลือกเตียงปรับระดับ →
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    if (!/^0\d{8,9}$/.test(get("phone").replace(/[-\s]/g, ""))) {
      showToast("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เช่น 081-234-5678", "info");
      return;
    }

    setSubmitting(true);
    trackEvent("add_payment_info", { currency: "THB", value: totals.dueToday, payment_type: payment });

    const order = saveOrder({
      items,
      totals,
      payment,
      needsApproval,
      customer: {
        name: get("fullName"),
        company: get("company") || undefined,
        province: get("province"),
        deliveryDate: get("deliveryDate") || undefined,
      },
    });

    trackEvent("purchase", {
      transaction_id: order.no,
      currency: "THB",
      value: totals.dueToday,
      payment_type: payment,
      items: items.map(ga4Item),
    });

    // Simulated payment gateway round-trip (MOCKUP — nothing is charged)
    setTimeout(() => {
      clear();
      router.push("/checkout/order-received/");
    }, 1400);
  }

  const today = new Date();
  const minDate = new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        {/* 1. Customer */}
        <Card n={1} title="ข้อมูลผู้เช่า">
          <div className="form-grid">
            <Field id="fullName" label="ชื่อ - นามสกุล *" required autoComplete="name" placeholder="เช่น วิภา สุขสมบูรณ์" />
            <Field id="phone" label="เบอร์โทรศัพท์ *" type="tel" required autoComplete="tel" placeholder="081-234-5678" />
            <Field id="email" label="อีเมล (รับใบเสร็จ / สัญญา) *" type="email" required autoComplete="email" placeholder="name@example.com" />
            <Field id="lineId" label="LINE ID (ถ้ามี)" placeholder="สำหรับแจ้งสถานะการจัดส่ง" />
            <Field id="company" label="ชื่อบริษัท / สถานพยาบาล (ถ้ามี)" autoComplete="organization" placeholder="กรณีต้องการใบกำกับภาษีในนามนิติบุคคล" />
            <Field id="taxId" label="เลขประจำตัวผู้เสียภาษี (ถ้ามี)" inputMode="numeric" maxLength={13} placeholder="13 หลัก" />
          </div>
        </Card>

        {/* 2. Delivery */}
        <Card n={2} title="ที่อยู่จัดส่งและติดตั้ง">
          <div className="form-grid">
            <Field id="address" label="บ้านเลขที่ / อาคาร / ถนน *" required autoComplete="street-address" full placeholder="เช่น 99/12 หมู่บ้านสุขใจ ถ.รามคำแหง" />
            <Field id="district" label="แขวง / เขต *" required placeholder="เช่น หัวหมาก, บางกะปิ" />
            <div className="form-group">
              <label className="form-label" htmlFor="province">
                จังหวัด *
              </label>
              <select id="province" name="province" className="form-control" required defaultValue="" autoComplete="address-level1">
                <option value="" disabled>
                  เลือกจังหวัด
                </option>
                {TH_STATES.map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <Field id="postcode" label="รหัสไปรษณีย์ *" required inputMode="numeric" maxLength={5} pattern="\d{5}" autoComplete="postal-code" placeholder="10240" />
            <Field id="deliveryDate" label="วันที่สะดวกให้จัดส่ง" type="date" min={minDate} />
            <div className="form-group form-col-full">
              <label className="form-label" htmlFor="deliveryNotes">
                ข้อมูลสำหรับทีมติดตั้ง
              </label>
              <textarea
                id="deliveryNotes"
                name="deliveryNotes"
                rows={2}
                className="form-control"
                placeholder="เช่น ห้องนอนชั้น 2 ไม่มีลิฟต์ / คอนโดต้องแลกบัตร / ต้องการเก็บเตียงเก่าออก"
              />
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-light">
            <Icon name="truck" className="text-hana-purple" /> ฟรีค่าจัดส่ง ติดตั้ง และสาธิตการใช้งาน ในกรุงเทพฯ และปริมณฑล (ต่างจังหวัด เจ้าหน้าที่จะแจ้งค่าบริการก่อนยืนยัน)
          </p>
        </Card>

        {/* 3. Payment */}
        <Card n={3} title="วิธีชำระเงิน">
          <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-sm)] border border-dashed border-hana-pink-ink/40 bg-hana-pink-tint px-4 py-3 text-xs text-hana-pink-ink">
            <Icon name="info" className="mt-0.5 shrink-0" />
            <span>
              <strong>Mockup:</strong> หน้านี้เป็นตัวอย่างหน้าตาระบบ ยังไม่เชื่อมต่อ Payment Gateway จริง ไม่มีการตัดเงิน และไม่ต้องกรอกข้อมูลบัตรจริง
            </span>
          </div>
          <div className="grid gap-2.5" role="radiogroup" aria-label="วิธีชำระเงิน">
            {PAYMENTS.map((m) => {
              const active = payment === m.id;
              return (
                <div key={m.id} className={`rounded-[var(--radius-sm)] border-2 transition ${active ? "border-hana-navy bg-hana-navy-tint/50" : "border-warm-border"}`}>
                  <button type="button" role="radio" aria-checked={active} onClick={() => setPayment(m.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? "border-hana-navy" : "border-warm-border"}`}>
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-hana-navy" />}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl text-hana-navy shadow-sm">
                      <Icon name={m.icon} />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{m.title}</span>
                      <span className="block text-xs text-ink-light">{m.desc}</span>
                    </span>
                  </button>
                  {active && m.id === "card" && (
                    <div className="grid gap-3 px-4 pb-4 sm:grid-cols-[2fr_1fr_1fr]">
                      {/* Demo-only inputs: no name attribute, never submitted or stored */}
                      <DemoInput label="หมายเลขบัตร" placeholder="4242 4242 4242 4242" />
                      <DemoInput label="หมดอายุ" placeholder="MM/YY" />
                      <DemoInput label="CVV" placeholder="•••" />
                      <p className="flex items-center gap-1.5 text-xs text-ink-light sm:col-span-3">
                        <Icon name="lock" /> ข้อมูลบัตรจะถูกเข้ารหัสและจัดเก็บโดยผู้ให้บริการชำระเงิน (PCI DSS) — Hana Care ไม่เก็บเลขบัตร
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {needsApproval && (
          <div className="flex gap-3 rounded-[var(--radius-md)] border border-hana-purple/30 bg-[#f6f2fc] p-5 text-sm text-ink-muted">
            <Icon name="file" className="mt-0.5 shrink-0 text-xl text-hana-purple" />
            <div>
              <strong className="text-hana-navy">มีรายการลีสซิ่ง / เช่าเพื่อเป็นเจ้าของ</strong>
              <br />
              สัญญาประเภทนี้ต้องผ่านการพิจารณาอนุมัติโดย ภัทรลิสซิ่ง เจ้าหน้าที่จะติดต่อขอสำเนาบัตรประชาชน (และเอกสารบริษัท กรณีนิติบุคคล) ภายใน 1 วันทำการ
              ระบบจะเรียกเก็บเงินงวดแรกหลังสัญญาได้รับอนุมัติแล้วเท่านั้น
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="space-y-4 lg:sticky lg:top-28">
        <OrderSummary items={items} totals={totals} />
        <label className="form-checkbox-label text-sm">
          <input type="checkbox" name="terms" required />
          <span>
            ข้าพเจ้ายอมรับ <a href="#" className="underline">เงื่อนไขการเช่า</a> และยินยอมให้ประมวลผลข้อมูลส่วนบุคคลตาม PDPA{" "}
            <a href="#" data-action="open-privacy" className="underline">
              นโยบายความเป็นส่วนตัว
            </a>
          </span>
        </label>
        <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full disabled:opacity-70">
          {submitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> กำลังดำเนินการ...
            </>
          ) : (
            <>
              <Icon name="lock" className="inline-icon" /> {needsApproval ? "ยืนยันคำสั่งเช่า" : `ชำระเงิน ${formatTHB(totals.dueToday)}`}
            </>
          )}
        </button>
        <Link href="/cart/" className="block text-center text-sm text-ink-muted hover:underline">
          ← กลับไปแก้ไขตะกร้า
        </Link>
      </div>
    </form>
  );
}

function Card({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-md)] border border-warm-border bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-hana-navy">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-hana-gradient text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ id, label, full, ...rest }: { id: string; label: string; full?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`form-group${full ? " form-col-full" : ""}`}>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} name={id} className="form-control" {...rest} />
    </div>
  );
}

function DemoInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="text-xs text-ink-light">
      {label}
      <input className="form-control mt-1 bg-white font-en" placeholder={placeholder} autoComplete="off" />
    </label>
  );
}

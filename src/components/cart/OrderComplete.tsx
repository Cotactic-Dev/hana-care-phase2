"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import { formatTHB } from "@/data/products";
import { contact } from "@/data/site";
import OrderSummary from "./OrderSummary";
import { loadOrder, type MockOrder } from "./order";

export default function OrderComplete() {
  const [order, setOrder] = useState<MockOrder | null | undefined>(undefined);
  useEffect(() => setOrder(loadOrder()), []);

  if (order === undefined) return <div className="h-96 animate-pulse rounded-[var(--radius-md)] bg-warm-bg" />;
  if (order === null) {
    return (
      <div className="rounded-[var(--radius-md)] bg-white px-6 py-16 text-center shadow-card">
        <h1 className="text-xl font-bold text-hana-navy">ไม่พบคำสั่งเช่าล่าสุด</h1>
        <Link href="/patient-beds/" className="btn btn-primary mt-6">
          เลือกเตียงปรับระดับ →
        </Link>
      </div>
    );
  }

  const paidNow = order.payment === "card" && !order.needsApproval;
  const headline = order.needsApproval
    ? "ได้รับคำสั่งเช่าแล้ว รอการอนุมัติสัญญา"
    : paidNow
      ? "ชำระเงินสำเร็จ ขอบคุณที่ไว้วางใจ Hana Care"
      : "ได้รับคำสั่งเช่าแล้ว รอการชำระเงิน";

  const date = new Date(order.createdAt).toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" });
  const delivery = order.customer.deliveryDate
    ? new Date(order.customer.deliveryDate).toLocaleDateString("th-TH", { dateStyle: "long" })
    : "เจ้าหน้าที่จะโทรนัดหมาย";

  const timeline: { icon: IconName; title: string; text: string; done: boolean }[] = [
    { icon: "check-circle", title: "รับคำสั่งเช่า", text: date, done: true },
    order.needsApproval
      ? { icon: "file", title: "ตรวจสอบเอกสารและอนุมัติสัญญา", text: "ภายใน 1 วันทำการ", done: false }
      : { icon: "card", title: "ชำระงวดแรก", text: paidNow ? "สำเร็จ" : "รอการชำระ", done: paidNow },
    { icon: "phone", title: "เจ้าหน้าที่โทรยืนยันวันจัดส่ง", text: "ภายใน 30 นาที (เวลาทำการ)", done: false },
    { icon: "truck", title: "จัดส่ง ติดตั้ง และสาธิตการใช้งาน", text: delivery, done: false },
  ];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <div className="rounded-[var(--radius-md)] bg-white p-6 text-center shadow-card sm:p-8">
          <div className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-3xl ${paidNow ? "bg-[#e7f8f0] text-success" : "bg-hana-navy-tint text-hana-navy"}`}>
            <Icon name={paidNow ? "check" : order.needsApproval ? "file" : "clock"} />
          </div>
          <span className="section-tag">ORDER {order.no}</span>
          <h1 className="mt-2 text-2xl font-bold text-hana-navy sm:text-3xl">{headline}</h1>
          <p className="mt-3 text-ink-muted">
            คุณ{order.customer.name}
            {order.customer.company ? ` (${order.customer.company})` : ""} — เราได้ส่งรายละเอียดคำสั่งเช่าไปทางอีเมลแล้ว
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-dashed border-hana-pink-ink/40 bg-hana-pink-tint px-3 py-1 text-xs font-semibold text-hana-pink-ink">
            <Icon name="info" /> Mockup — ไม่มีการตัดเงินหรือส่งอีเมลจริง
          </p>
        </div>

        {!order.needsApproval && order.payment === "promptpay" && (
          <div className="rounded-[var(--radius-md)] bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-bold text-hana-navy">สแกนจ่ายด้วยพร้อมเพย์</h2>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="rounded-[var(--radius-sm)] border border-warm-border p-3">
                <FakeQR seed={order.no} />
              </div>
              <div className="text-sm text-ink-muted">
                <div>ยอดชำระ</div>
                <div className="text-3xl font-bold text-hana-navy">{formatTHB(order.totals.dueToday)}</div>
                <div className="mt-2">บริษัท ภัทรลิสซิ่ง จำกัด (มหาชน)</div>
                <div className="mt-1 text-xs text-ink-light">QR ตัวอย่างสำหรับ Mockup — สแกนไม่ได้ · หมดอายุใน 15 นาที</div>
              </div>
            </div>
          </div>
        )}

        {!order.needsApproval && order.payment === "transfer" && (
          <div className="rounded-[var(--radius-md)] bg-white p-6 shadow-card">
            <h2 className="mb-3 text-lg font-bold text-hana-navy">โอนเงินเข้าบัญชี</h2>
            <dl className="grid gap-y-2 text-sm sm:grid-cols-[160px_1fr]">
              <dt className="text-ink-light">ธนาคาร</dt>
              <dd className="font-medium">ธนาคารตัวอย่าง (Mockup)</dd>
              <dt className="text-ink-light">ชื่อบัญชี</dt>
              <dd className="font-medium">บจ. ภัทรลิสซิ่ง (มหาชน)</dd>
              <dt className="text-ink-light">เลขที่บัญชี</dt>
              <dd className="font-en font-medium">000-0-00000-0</dd>
              <dt className="text-ink-light">ยอดโอน</dt>
              <dd className="font-bold text-hana-navy">{formatTHB(order.totals.dueToday)}</dd>
            </dl>
            <p className="mt-3 text-xs text-ink-light">โอนแล้วส่งสลิปพร้อมเลขคำสั่งเช่า {order.no} ทาง LINE {contact.lineId} ภายใน 24 ชม.</p>
          </div>
        )}

        <div className="rounded-[var(--radius-md)] bg-white p-6 shadow-card">
          <h2 className="mb-5 text-lg font-bold text-hana-navy">ขั้นตอนถัดไป</h2>
          <ol className="relative space-y-5 border-l-2 border-warm-border pl-6">
            {timeline.map((s) => (
              <li key={s.title} className="relative">
                <span
                  className={`absolute top-0 -left-[37px] grid h-7 w-7 place-items-center rounded-full text-sm ${
                    s.done ? "bg-hana-navy text-white" : "border-2 border-warm-border bg-white text-ink-light"
                  }`}
                >
                  <Icon name={s.icon} />
                </span>
                <div className={`font-semibold ${s.done ? "text-hana-navy" : "text-ink"}`}>{s.title}</div>
                <div className="text-sm text-ink-light">{s.text}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href={contact.lineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            <Icon name="chat" className="inline-icon" /> ติดตามสถานะทาง LINE
          </a>
          <Link href="/" className="btn btn-secondary">
            กลับหน้าแรก
          </Link>
        </div>
      </div>

      <div className="lg:sticky lg:top-28">
        <OrderSummary items={order.items} totals={order.totals} title={`คำสั่งเช่า ${order.no}`} />
      </div>
    </div>
  );
}

/** Deterministic QR-looking pattern (decorative only). */
function FakeQR({ seed }: { seed: string }) {
  const N = 25;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => ((h = (h * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [N - 7, 0],
      [0, N - 7],
    ].some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (!finder(x, y) && rand() > 0.5) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x} y={y} width={7} height={7} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} width={180} height={180} fill="#0a173f" role="img" aria-label="QR พร้อมเพย์ตัวอย่าง">
      <rect x={-1} y={-1} width={N + 2} height={N + 2} fill="#fff" />
      {cells}
      <Finder x={0} y={0} />
      <Finder x={N - 7} y={0} />
      <Finder x={0} y={N - 7} />
    </svg>
  );
}

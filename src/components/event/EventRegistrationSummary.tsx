"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { EVENT_REG_KEY, type EventRegistration } from "./EventRegistrationForm";

/** Shows the submitter's details on the thank-you page (read from sessionStorage, never the URL). */
export default function EventRegistrationSummary() {
  const [reg, setReg] = useState<EventRegistration | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(EVENT_REG_KEY);
      setReg(raw ? (JSON.parse(raw) as EventRegistration) : null);
    } catch {
      setReg(null);
    }
  }, []);

  if (reg === undefined) return <div className="h-56 animate-pulse rounded-[var(--radius-md)] bg-warm-bg" />;

  if (reg === null) {
    return (
      <div className="rounded-[var(--radius-md)] border border-warm-border bg-white p-6 text-center text-ink-muted">
        ไม่พบข้อมูลการลงทะเบียน
        <div className="mt-4">
          <Link href="/press-launch/" className="btn btn-primary btn-sm">
            ไปหน้าลงทะเบียน
          </Link>
        </div>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["ชื่อ - นามสกุล", reg.name],
    ["เบอร์โทรศัพท์", reg.phone],
    ["E-mail", reg.email],
    ["บริษัท / องค์กร", reg.company],
    ["เวลาลงทะเบียน", new Date(reg.submittedAt).toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" })],
  ];

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-warm-border bg-white text-left shadow-card">
      <div className="flex items-center justify-between gap-3 bg-hana-navy px-6 py-4 text-white">
        <span className="flex items-center gap-2 font-semibold">
          <Icon name="clipboard" /> ข้อมูลผู้ลงทะเบียน
        </span>
        <span className="rounded-full bg-white/15 px-3 py-1 font-en text-sm font-semibold tracking-wide">{reg.regNo}</span>
      </div>
      <dl className="divide-y divide-warm-border-light px-6">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[160px_1fr] sm:gap-4">
            <dt className="text-sm text-ink-light">{k}</dt>
            <dd className="font-semibold break-words text-ink">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

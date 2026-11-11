"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUI } from "@/components/ui/UIProvider";
import { trackEvent } from "@/lib/analytics";

export const EVENT_REG_KEY = "hana_event_registration";

export type EventRegistration = { regNo: string; name: string; phone: string; email: string; company: string; submittedAt: string };

/**
 * Press-launch registration (ชื่อ / เบอร์ / E-mail / บริษัท).
 * TODO(backend): POST to CRM / Google Sheet / email before redirect — currently front-end only like the Phase 1 lead form.
 */
export default function EventRegistrationForm() {
  const router = useRouter();
  const { showToast } = useUI();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const data = { name: get("fullName"), phone: get("phone"), email: get("email"), company: get("company") };

    if (!data.name || !data.phone || !data.email || !data.company) {
      showToast("กรุณากรอกข้อมูลให้ครบทุกช่องครับ", "info");
      return;
    }
    if (!/^0\d{8,9}$/.test(data.phone.replace(/[-\s]/g, ""))) {
      showToast("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง เช่น 081-234-5678", "info");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showToast("กรุณากรอกอีเมลให้ถูกต้อง", "info");
      return;
    }
    if (!fd.get("pdpaConsent")) {
      showToast("กรุณากดยินยอมการประมวลผลข้อมูลส่วนบุคคล (PDPA) ครับ", "info");
      return;
    }

    setSubmitting(true);
    const reg: EventRegistration = {
      ...data,
      regNo: `PL-${String(Math.floor(1000 + Math.random() * 9000))}`,
      submittedAt: new Date().toISOString(),
    };
    // No PII in analytics payloads
    trackEvent("generate_lead", { lead_type: "press_launch_registration" });
    // PDPA: keep PII out of the URL — hand it to the thank-you page via sessionStorage
    try {
      sessionStorage.setItem(EVENT_REG_KEY, JSON.stringify(reg));
    } catch {}
    router.push("/press-launch/thank-you/");
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group form-col-full">
          <label className="form-label" htmlFor="fullName">
            ชื่อ - นามสกุล *
          </label>
          <input type="text" id="fullName" name="fullName" className="form-control" placeholder="เช่น วิภา สุขสมบูรณ์" autoComplete="name" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="phone">
            เบอร์โทรศัพท์ *
          </label>
          <input type="tel" id="phone" name="phone" className="form-control" placeholder="081-234-5678" autoComplete="tel" inputMode="tel" required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            E-mail *
          </label>
          <input type="email" id="email" name="email" className="form-control" placeholder="name@company.com" autoComplete="email" required />
        </div>
        <div className="form-group form-col-full">
          <label className="form-label" htmlFor="company">
            บริษัท / องค์กร *
          </label>
          <input type="text" id="company" name="company" className="form-control" placeholder="เช่น โรงพยาบาลตัวอย่าง / สำนักข่าวตัวอย่าง" autoComplete="organization" required />
        </div>
        <div className="form-group form-col-full">
          <label className="form-checkbox-label">
            <input type="checkbox" name="pdpaConsent" defaultChecked required />
            <span>
              ข้าพเจ้ายินยอมให้ Hana Care จัดเก็บและใช้ข้อมูลเพื่อการลงทะเบียนและติดต่อกลับ ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA){" "}
              <a href="#" data-action="open-privacy" className="underline">
                อ่านนโยบาย
              </a>
            </span>
          </label>
        </div>
        <div className="form-group form-col-full">
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full disabled:opacity-70">
            {submitting ? "กำลังลงทะเบียน..." : "ลงทะเบียน →"}
          </button>
        </div>
      </div>
    </form>
  );
}

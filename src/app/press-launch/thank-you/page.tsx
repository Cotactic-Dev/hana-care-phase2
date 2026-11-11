import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import EventRegistrationSummary from "@/components/event/EventRegistrationSummary";

export const metadata: Metadata = {
  title: { absolute: "ลงทะเบียนสำเร็จ | Hana Care" },
  robots: { index: false, follow: false },
};

export default function PressLaunchThankYouPage() {
  return (
    <section className="section bg-warm-bg">
      <div className="container container-narrow text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-primary-subtle text-[2.5rem] text-primary shadow-card">
          <Icon name="check" />
        </div>
        <span className="section-tag">REGISTRATION CONFIRMED</span>
        <h1 className="section-title mb-4">ลงทะเบียนสำเร็จ ขอบคุณที่ร่วมงานกับ Hana Care</h1>
        <p className="section-desc mb-8">กรุณาแสดงหน้านี้ หรือแจ้งชื่อ ณ จุดลงทะเบียนหน้างาน</p>

        <div className="mx-auto max-w-[560px]">
          <EventRegistrationSummary />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/press-launch/" className="btn btn-primary">
            ลงทะเบียนท่านถัดไป
          </Link>
          <Link href="/patient-beds/" className="btn btn-secondary">
            ชมเตียงปรับระดับ 3 รุ่น
          </Link>
        </div>
      </div>
    </section>
  );
}

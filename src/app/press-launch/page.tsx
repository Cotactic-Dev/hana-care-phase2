import type { Metadata } from "next";
import Icon from "@/components/ui/Icon";
import EventRegistrationForm from "@/components/event/EventRegistrationForm";
import { contact } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "ลงทะเบียนร่วมงานแถลงข่าวเปิดตัว Hana Care" },
  description: "ลงทะเบียนร่วมงานแถลงข่าวเปิดตัวบริการเช่าเตียงปรับระดับ Hana Care โดย บมจ. ภัทรลิสซิ่ง",
  // Event-only landing page: keep it out of search results
  robots: { index: false, follow: false },
  alternates: { canonical: "/press-launch/" },
};

export default function PressLaunchPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-tag">PRESS CONFERENCE REGISTRATION</span>
          <h1 className="page-hero-title">ลงทะเบียนร่วมงานแถลงข่าวเปิดตัว Hana Care</h1>
          <p className="page-hero-desc">
            บริการเช่าเตียงปรับระดับมาตรฐานญี่ปุ่น France Bed โดย บมจ. ภัทรลิสซิ่ง — กรอกข้อมูลเพื่อลงทะเบียนเข้าร่วมงาน
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="form-section-wrapper">
            <div className="form-info-pane">
              <div>
                <span className="section-tag bg-white/20! text-white!">EVENT REGISTRATION</span>
                <h3>ลงทะเบียนวันแถลงข่าว</h3>
                <p>กรอกข้อมูล 4 ช่อง ใช้เวลาไม่ถึง 1 นาที เจ้าหน้าที่จะใช้ข้อมูลนี้เพื่อยืนยันการเข้าร่วมงานและติดต่อกลับ</p>
                <div className="form-direct-contacts">
                  <div className="contact-direct-item">
                    <div className="contact-direct-icon"><Icon name="phone" /></div>
                    <div>
                      <div className="text-[0.8rem] opacity-80">สอบถามเพิ่มเติม:</div>
                      <strong>{contact.phoneDisplay}</strong>
                    </div>
                  </div>
                  <div className="contact-direct-item">
                    <div className="contact-direct-icon"><Icon name="chat" /></div>
                    <div>
                      <div className="text-[0.8rem] opacity-80">LINE Official:</div>
                      <strong>{contact.lineId}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-xs opacity-75">* ข้อมูลของท่านจะได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</div>
            </div>
            <div className="form-inputs-pane">
              <EventRegistrationForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import CheckoutForm from "@/components/cart/CheckoutForm";
import CheckoutSteps from "@/components/cart/CheckoutSteps";

export const metadata: Metadata = {
  title: "ชำระเงิน",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <section className="section bg-warm-bg">
      <div className="container">
        <CheckoutSteps current={1} />
        <h1 className="section-title mb-8 text-left!">ข้อมูลจัดส่งและชำระเงิน</h1>
        <CheckoutForm />
      </div>
    </section>
  );
}

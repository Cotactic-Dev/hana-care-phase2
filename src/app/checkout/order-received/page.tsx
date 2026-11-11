import type { Metadata } from "next";
import CheckoutSteps from "@/components/cart/CheckoutSteps";
import OrderComplete from "@/components/cart/OrderComplete";

export const metadata: Metadata = {
  title: "ยืนยันคำสั่งเช่า",
  robots: { index: false, follow: false },
};

export default function OrderCompletePage() {
  return (
    <section className="section bg-warm-bg">
      <div className="container">
        <CheckoutSteps current={2} />
        <OrderComplete />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import CheckoutSteps from "@/components/cart/CheckoutSteps";

export const metadata: Metadata = {
  title: "ตะกร้าเช่าเตียง",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <section className="section bg-warm-bg">
      <div className="container">
        <CheckoutSteps current={0} />
        <h1 className="section-title mb-8 text-left!">ตะกร้าเช่าเตียง</h1>
        <CartView />
      </div>
    </section>
  );
}

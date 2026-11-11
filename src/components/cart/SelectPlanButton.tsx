"use client";

import type { PlanId, ProductSlug } from "@/data/products";
import { trackEvent } from "@/lib/analytics";

export const SELECT_PLAN_EVENT = "hana:select-plan";

/** On a product page: preselect a plan in <RentalConfigurator/> and scroll up to it. */
export default function SelectPlanButton({ plan, slug, className, children }: { plan: PlanId; slug: ProductSlug; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.dispatchEvent(new CustomEvent(SELECT_PLAN_EVENT, { detail: { plan } }));
        document.getElementById("rent")?.scrollIntoView({ behavior: "smooth", block: "start" });
        trackEvent("select_plan", { plan, model: slug });
      }}
    >
      {children}
    </button>
  );
}

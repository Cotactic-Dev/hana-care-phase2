// Phase 2 rental pricing RULES (MOCKUP — all numbers are SAMPLE DATA, confirm with the client).
// Rule: the longer the contract, the bigger the discount on the monthly rent.
// WooCommerce later: plan × term = variations of a variable (subscription) product,
// discounted rent = variation sale price, deposit = sign-up fee.
import { getProduct, type PlanId, type Product, type ProductSlug } from "./products";

export interface TermOption {
  months: number;
  /** fraction off the base monthly price, e.g. 0.1 = 10% */
  discount: number;
}

/** Selectable contract lengths per plan (→ attribute pa_contract-term). */
export const termOptions: Record<PlanId, TermOption[]> = {
  short: [
    { months: 1, discount: 0 },
    { months: 2, discount: 0 },
    { months: 3, discount: 0.05 },
    { months: 6, discount: 0.1 },
  ],
  lease: [
    { months: 12, discount: 0 },
    { months: 24, discount: 0.08 },
    { months: 36, discount: 0.15 },
  ],
  rto: [
    { months: 24, discount: 0 },
    { months: 36, discount: 0.07 },
  ],
};

/** Refundable security deposit, in months of base rent (→ _subscription_sign_up_fee). */
export const depositMonths: Record<PlanId, number> = { short: 1, lease: 0, rto: 0 };

export const MAX_QTY = 10;

export const defaultMonths = (plan: PlanId) => termOptions[plan][0].months;

export const maxDiscount = (plan: PlanId) => Math.max(...termOptions[plan].map((t) => t.discount));

export const formatTerm = (months: number) =>
  months >= 12 && months % 12 === 0 ? `${months / 12} ปี (${months} เดือน)` : `${months} เดือน`;

export const formatTermShort = (months: number) => formatTerm(months).replace(/ \(.*\)/, "");

export const pct = (d: number) => `${Math.round(d * 100)}%`;

/** Round to the nearest 10 THB so discounted prices look like real price points. */
export const round10 = (n: number) => Math.round(n / 10) * 10;

// ---------- quotes & cart ----------

export interface Quote {
  baseMonthly: number;
  discount: number;
  /** per unit, after discount */
  monthly: number;
  qty: number;
  months: number;
  monthlyTotal: number;
  contractTotal: number;
  savings: number;
  deposit: number;
  /** first month + deposit */
  dueToday: number;
}

export const getDiscount = (plan: PlanId, months: number) => termOptions[plan].find((t) => t.months === months)?.discount ?? 0;

export function quote(product: Product, plan: PlanId, months: number, qty = 1): Quote {
  const baseMonthly = product.monthly[plan];
  const discount = getDiscount(plan, months);
  const monthly = round10(baseMonthly * (1 - discount));
  const deposit = baseMonthly * depositMonths[plan] * qty;
  return {
    baseMonthly,
    discount,
    monthly,
    qty,
    months,
    monthlyTotal: monthly * qty,
    contractTotal: monthly * months * qty,
    savings: (baseMonthly - monthly) * months * qty,
    deposit,
    dueToday: monthly * qty + deposit,
  };
}

export interface CartItem {
  id: string;
  slug: ProductSlug;
  plan: PlanId;
  months: number;
  qty: number;
}

export const cartItemId = (slug: ProductSlug, plan: PlanId, months: number) => `${slug}__${plan}__${months}`;

export interface CartTotals {
  count: number;
  monthlyTotal: number;
  dueToday: number;
  deposit: number;
  contractTotal: number;
  savings: number;
}

export function cartTotals(items: CartItem[]): CartTotals {
  const t: CartTotals = { count: 0, monthlyTotal: 0, dueToday: 0, deposit: 0, contractTotal: 0, savings: 0 };
  for (const it of items) {
    const p = getProduct(it.slug);
    if (!p) continue;
    const q = quote(p, it.plan, it.months, it.qty);
    t.count += it.qty;
    t.monthlyTotal += q.monthlyTotal;
    t.dueToday += q.dueToday;
    t.deposit += q.deposit;
    t.contractTotal += q.contractTotal;
    t.savings += q.savings;
  }
  return t;
}

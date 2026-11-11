const STEPS = ["ตะกร้า", "ข้อมูลจัดส่ง & ชำระเงิน", "ยืนยันคำสั่งเช่า"];

export default function CheckoutSteps({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span className={`flex items-center gap-2 ${i <= current ? "font-semibold text-hana-navy" : "text-ink-light"}`}>
            <span
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                i < current ? "bg-hana-navy text-white" : i === current ? "bg-hana-gradient text-white" : "border border-warm-border bg-white"
              }`}
            >
              {i < current ? "✓" : i + 1}
            </span>
            {s}
          </span>
          {i < STEPS.length - 1 && <span className="h-px w-6 bg-warm-border sm:w-10" />}
        </li>
      ))}
    </ol>
  );
}

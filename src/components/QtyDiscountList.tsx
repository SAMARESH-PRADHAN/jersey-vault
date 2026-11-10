
import { Percent, Sparkles, Tag } from "lucide-react";
import { QTY_DISCOUNT_TIERS, getQtyDiscountPct } from "@/data/products";
import { cn } from "@/lib/utils";

export function QtyDiscountList({
  qty,
  className,
}: {
  qty: number;
  className?: string;
}) {
  const active = getQtyDiscountPct(qty);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-lime/30 bg-gradient-to-br from-lime/10 via-background to-background shadow-sm",
        className
      )}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lime/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-lime/10 blur-2xl" />

      <div className="relative p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-black shadow-sm">
              <Tag className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black uppercase tracking-wide">
                  Bulk Order Offers
                </p>

                <Sparkles className="h-4 w-4 text-lime" />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Save more when you order more
              </p>
            </div>
          </div>

          {/* Active discount badge */}
          {active > 0 && (
            <div className="shrink-0 rounded-full bg-lime px-3 py-1.5 text-xs font-black text-black shadow-sm">
              {active}% OFF
            </div>
          )}
        </div>

        {/* Discount tiers */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QTY_DISCOUNT_TIERS.map((t) => {
            const isActive = active === t.pct;

            return (
              <div
                key={t.pct}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-3 transition-all duration-200",
                  isActive
                    ? "border-lime bg-lime/15 shadow-md shadow-lime/10 ring-1 ring-lime/30"
                    : "border-border bg-background/70 hover:border-lime/40 hover:bg-lime/5"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 top-2">
                    <span className="flex h-2 w-2 rounded-full bg-lime shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
                  </div>
                )}

                <p
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-wide",
                    isActive ? "text-lime" : "text-muted-foreground"
                  )}
                >
                  {t.label}
                </p>

                <p
                  className={cn(
                    "mt-1 text-xl font-black tracking-tight",
                    isActive ? "text-lime" : "text-foreground"
                  )}
                >
                  {t.pct}%
                  <span className="ml-1 text-[10px] font-bold uppercase">
                    OFF
                  </span>
                </p>

                {isActive && (
                  <p className="mt-1 text-[10px] font-bold text-lime/80">
                    Current offer
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom information */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2">
          <Percent className="h-3.5 w-3.5 shrink-0 text-lime" />

          <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
            Discount applies to product price only. Print charges are not
            discounted.
          </p>
        </div>
      </div>
    </div>
  );
}

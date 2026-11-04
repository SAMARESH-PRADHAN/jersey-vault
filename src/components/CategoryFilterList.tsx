import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/types";

export interface CategoryFilterItem {
  slug: CategorySlug | "all";
  label: string;
}

/** Category switcher used by the shop and premium collection filter sidebars. */
export function CategoryFilterList({ categories, active, onSelect, className }: {
  categories: CategoryFilterItem[];
  active: CategorySlug | "all";
  onSelect: (slug: CategorySlug | "all") => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {categories.map((item) => {
        const isActive = active === item.slug;
        const isPremium = item.slug === "custom-premium";
        return (
          <button key={item.slug} type="button" onClick={() => onSelect(item.slug)} aria-pressed={isActive}
            className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold transition-colors",
              isPremium
                ? "border border-lime/50 bg-lime/10 text-lime shadow-[0_0_16px_rgba(190,242,100,0.22)] hover:bg-lime/20"
                : isActive ? "bg-primary/15 text-lime" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground")}>
            <span className="min-w-0">{item.label}</span>
            {isPremium ? (
              <span className="flex shrink-0 items-center gap-1.5">
                {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                <span className="rounded-full bg-lime px-1.5 py-0.5 text-[9px] font-black tracking-widest text-lime-foreground">★ PREMIUM</span>
              </span>
            ) : isActive ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
          </button>
        );
      })}
    </div>
  );
}

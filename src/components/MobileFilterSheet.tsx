import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/kit";
import { PRODUCTS, SHOP_CATEGORIES, TOP_WEAR_SUBCATEGORIES } from "@/data/products";
import { inr } from "@/lib/storage";
import type { CategorySlug, TopWearSubCategory } from "@/types";

export type ShopSort = "featured" | "low" | "high" | "rating";
export interface ShopFilters {
  category: CategorySlug | "all";
  subCategory: TopWearSubCategory;
  range: [number, number];
  materials: string[];
  sort: ShopSort;
}
export const MAX_PRICE = 2000;
export const SHOP_MATERIALS = Array.from(new Set(PRODUCTS.filter((p) => p.category !== "winter-top-wear").map((p) => p.material))).sort();
export const matchingProducts = (filters: ShopFilters) => PRODUCTS.filter((p) =>
  (filters.category === "all" ? p.category !== "winter-top-wear" : p.category === filters.category) &&
  (filters.category !== "top-wear" || filters.subCategory === "all" || p.subCategory === filters.subCategory) &&
  p.price >= filters.range[0] && p.price <= filters.range[1] &&
  (!filters.materials.length || filters.materials.includes(p.material))
);

export function MobileFilterSheet({ initial, onClose, onApply }: {
  initial: ShopFilters;
  onClose: () => void;
  onApply: (filters: ShopFilters) => void;
}) {
  const [draft, setDraft] = useState<ShopFilters>(initial);
  const reducedMotion = useReducedMotion();
  const count = matchingProducts(draft).length;
  const update = (patch: Partial<ShopFilters>) => setDraft((prev) => ({ ...prev, ...patch }));
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-sm lg:hidden" />
        <Dialog.Content asChild aria-describedby={undefined}>
          <motion.div initial={{ y: reducedMotion ? 0 : "100%" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[111] flex max-h-[90dvh] flex-col rounded-t-2xl border border-border bg-surface outline-none lg:hidden">
            <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/50" />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3">
              <Dialog.Title className="text-2xl">Filter & Sort</Dialog.Title>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters"><X className="h-5 w-5" /></Button>
            </div>
            <div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
              <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">Category</legend>
                <div className="grid grid-cols-2 gap-2">
                  {[{ slug: "all" as const, label: "All Jerseys" }, ...SHOP_CATEGORIES].map((c) => (
                    <Button key={c.slug} variant={draft.category === c.slug ? "lime" : "outline"} aria-pressed={draft.category === c.slug}
                      className="h-auto min-h-11 justify-start rounded-lg px-3 py-2 text-left text-xs"
                      onClick={() => update({ category: c.slug, subCategory: "all" })}>
                      <span className="min-w-0">{c.label}</span>{draft.category === c.slug ? <Check className="h-3 w-3 shrink-0" /> : null}
                    </Button>
                  ))}
                </div>
              </fieldset>
              {draft.category === "top-wear" ? <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">Neck style</legend>
                <div className="flex flex-wrap gap-2">{TOP_WEAR_SUBCATEGORIES.map((sub) => (
                  <Button key={sub.slug} variant={draft.subCategory === sub.slug ? "lime" : "outline"} aria-pressed={draft.subCategory === sub.slug}
                    className="px-3 text-xs" onClick={() => update({ subCategory: sub.slug })}>{sub.label}</Button>
                ))}</div>
              </fieldset> : null}
              <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">Price range</legend>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <input type="number" aria-label="Filter minimum price" min={0} max={draft.range[1]} value={draft.range[0]}
                    onChange={(e) => update({ range: [Math.max(0, Math.min(Number(e.target.value), draft.range[1])), draft.range[1]] })}
                    className="h-12 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-base" />
                  <span className="text-muted-foreground">–</span>
                  <input type="number" aria-label="Filter maximum price" min={draft.range[0]} max={MAX_PRICE} value={draft.range[1]}
                    onChange={(e) => update({ range: [draft.range[0], Math.min(MAX_PRICE, Math.max(Number(e.target.value), draft.range[0]))] })}
                    className="h-12 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-base" />
                </div>
                <input type="range" aria-label="Filter maximum price slider" min={draft.range[0]} max={MAX_PRICE} step={50} value={draft.range[1]}
                  onChange={(e) => update({ range: [draft.range[0], Number(e.target.value)] })} className="mt-3 h-8 w-full accent-[var(--color-primary)]" />
                <p className="text-xs text-muted-foreground">{inr(draft.range[0])} — {inr(draft.range[1])}</p>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-xs font-bold uppercase text-muted-foreground">Material</legend>
                {SHOP_MATERIALS.map((material) => <label key={material} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-border/50 py-2 text-sm">
                  <input type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--color-lime)]" checked={draft.materials.includes(material)}
                    onChange={() => update({ materials: draft.materials.includes(material) ? draft.materials.filter((m) => m !== material) : [...draft.materials, material] })} />
                  <span className="min-w-0">{material}</span>
                </label>)}
              </fieldset>
              <div>
                <label htmlFor="mobile-sort" className="text-xs font-bold uppercase text-muted-foreground">Sort by</label>
                <select id="mobile-sort" value={draft.sort} onChange={(e) => update({ sort: e.target.value as ShopSort })}
                  className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-base">
                  <option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option>
                </select>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-border bg-surface px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="ghost" className="px-2 text-xs" onClick={() => setDraft({ category: "all", subCategory: "all", range: [0, MAX_PRICE], materials: [], sort: "featured" })}>Reset All</Button>
              <Button variant="lime" onClick={() => onApply(draft)} className="px-3 text-xs">Apply & Show {count} Items</Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "framer-motion";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { Button, Card, ProductSkeleton } from "@/components/ui/kit";
import { ProductCard } from "@/components/ProductCard";
import { WINTER_PRODUCTS, WINTER_SUBCATEGORIES } from "@/data/products";
import { inr } from "@/lib/storage";
import type { WinterSubCategory } from "@/types";
import hero from "@/assets/hero-1.jpg";

type Sort = "featured" | "low" | "high" | "rating";

const MAXP = 2500;

export const Route = createFileRoute("/winter-top-wear")({
  validateSearch: (search: Record<string, unknown>): { sub?: WinterSubCategory | undefined } => {
    const requested = typeof search["sub"] === "string" ? search["sub"] : "all";
    const sub = WINTER_SUBCATEGORIES.some((item) => item.slug === requested) ? (requested as WinterSubCategory) : "all";
    return { sub: sub === "all" ? undefined : sub };
  },
  head: () => ({
    meta: [
      { title: "Winter Top Wear — Hoodies, Sweatshirts & Oversized Tees | Jersey Fit" },
      { name: "description", content: "Shop Jersey Fit's winter top wear: heavyweight fleece hoodies, French terry sweatshirts and oversized tees. Ready-to-wear, no customisation, ships across India." },
      { property: "og:title", content: "Winter Top Wear — Jersey Fit" },
      { property: "og:description", content: "Heavyweight hoodies, sweatshirts and oversized tees for cold mornings and winter training." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/winter-top-wear" }],
  }),
  component: WinterTopWear,
});

function WinterTopWear() {
  const sub = Route.useSearch().sub ?? "all";
  const navigate = Route.useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, MAXP]);
  const [sort, setSort] = useState<Sort>("featured");
  const [loading, setLoading] = useState(true);

  // Simulated fetch — swap for GET /api/products?collection=winter later.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [sub, sort, range[0], range[1]]);

  const list = useMemo(() => {
    let l = WINTER_PRODUCTS.filter((p) => (sub === "all" || p.subCategory === sub) && p.price >= range[0] && p.price <= range[1]);
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [sub, range, sort]);

  const setSub = (next: WinterSubCategory) =>
    navigate({ to: ".", search: { sub: next === "all" ? undefined : next } });

  const activeCount = (sub !== "all" ? 1 : 0) + (range[0] !== 0 || range[1] !== MAXP ? 1 : 0) + (sort !== "featured" ? 1 : 0);
  const resetFilters = () => {
    setRange([0, MAXP]);
    setSort("featured");
    setSub("all");
  };

  return (
    <div>
      {/* banner */}
      <section className="relative min-h-[230px] overflow-hidden border-b border-border lg:min-h-[330px]">
        <img src={hero} alt="Winter Top Wear banner" width={1600} height={900}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[230px] items-end py-8 lg:min-h-[330px] lg:py-12">
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Cold Weather Performance</span>
            <h1 className="mt-3 text-4xl sm:text-6xl">Winter Top Wear</h1>
            <p className="mt-4 max-w-xl text-sm text-foreground/80 sm:text-base">
              Hoodies, sweatshirts and oversized tees — heavy on warmth, light on fuss. Ready-made, maximum 3 pieces per order.
            </p>
          </div>
        </div>
      </section>

      {/* subcategory switcher */}
      <div className="shell flex flex-wrap gap-2 py-4">
        {WINTER_SUBCATEGORIES.map((item) => (
          <Button key={item.slug} variant={sub === item.slug ? "lime" : "outline"} aria-pressed={sub === item.slug}
            className="px-3 text-xs" onClick={() => setSub(item.slug)}>{item.label}</Button>
        ))}
      </div>

      {/* mobile filter trigger */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-xl md:top-18 lg:hidden">
        <div className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
          <p className="min-w-0 text-xs font-bold text-muted-foreground" aria-live="polite">Showing {list.length} Products</p>
          <Button variant="lime" className="gap-2 px-4 text-xs" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4 shrink-0" />Filter & Sort
            {activeCount ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background text-foreground" aria-label={`${activeCount} active filters`}>{activeCount}</span> : null}
          </Button>
        </div>
      </div>
      {filterOpen ? (
        <WinterFilterSheet initialSub={sub} range={range} sort={sort} onClose={() => setFilterOpen(false)}
          onApply={(nextSub, nextRange, nextSort) => { setSub(nextSub); setRange(nextRange); setSort(nextSort); setFilterOpen(false); }} />
      ) : null}

      <div className="shell py-6 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* filters — subcategory + price + sort */}
          <div className="hidden lg:block">
            <Card className="h-fit lg:sticky lg:top-24">
              <h3 className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-lime" /> Filters</h3>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subcategory</p>
                <div className="mt-3 flex flex-col gap-2">
                  {WINTER_SUBCATEGORIES.map((item) => (
                    <Button key={item.slug} variant={sub === item.slug ? "lime" : "outline"} aria-pressed={sub === item.slug}
                      className="h-auto min-h-10 justify-start rounded-lg px-3 py-2 text-left text-xs" onClick={() => setSub(item.slug)}>
                      <span className="min-w-0">{item.label}</span>{sub === item.slug ? <Check className="h-3 w-3 shrink-0" /> : null}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price range</p>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" aria-label="Minimum price" value={range[0]} min={0} max={range[1]}
                    onChange={(e) => setRange([Math.min(Number(e.target.value), range[1]), range[1]])}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm" />
                  <span className="text-muted-foreground">–</span>
                  <input type="number" aria-label="Maximum price" value={range[1]} min={range[0]} max={MAXP}
                    onChange={(e) => setRange([range[0], Math.max(Number(e.target.value), range[0])])}
                    className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm" />
                </div>
                <input type="range" aria-label="Maximum price slider" min={0} max={MAXP} step={50} value={range[1]}
                  onChange={(e) => setRange([range[0], Number(e.target.value)])}
                  className="mt-4 w-full accent-[var(--color-primary)]" />
                <p className="mt-2 text-xs text-muted-foreground">{inr(range[0])} — {inr(range[1])}</p>
              </div>
              <div className="mt-6">
                <label htmlFor="winter-sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</label>
                <select id="winter-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm">
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
              <Button variant="outline" className="mt-6 w-full" onClick={resetFilters}>Reset filters</Button>
            </Card>
          </div>

          {/* grid */}
          <div className="min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : list.length === 0 ? (
              <Card className="py-16 text-center">
                <h3 className="text-xl">No products match those filters</h3>
                <p className="mt-2 text-sm text-muted-foreground">Try widening the price range.</p>
                <Button className="mt-5" onClick={resetFilters}>Clear filters</Button>
              </Card>
            ) : (
              <>
                <p className="mb-4 hidden text-xs font-bold uppercase tracking-wider text-muted-foreground lg:block">
                  {list.length} product{list.length > 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                  {list.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WinterFilterSheet({ initialSub, range, sort, onClose, onApply }: {
  initialSub: WinterSubCategory;
  range: [number, number];
  sort: Sort;
  onClose: () => void;
  onApply: (sub: WinterSubCategory, range: [number, number], sort: Sort) => void;
}) {
  const [draftSub, setDraftSub] = useState<WinterSubCategory>(initialSub);
  const [draftRange, setDraftRange] = useState<[number, number]>(range);
  const [draftSort, setDraftSort] = useState<Sort>(sort);
  const reducedMotion = useReducedMotion();
  const count = WINTER_PRODUCTS.filter((p) => (draftSub === "all" || p.subCategory === draftSub) && p.price >= draftRange[0] && p.price <= draftRange[1]).length;
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
                <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">Subcategory</legend>
                <div className="flex flex-wrap gap-2">
                  {WINTER_SUBCATEGORIES.map((item) => (
                    <Button key={item.slug} variant={draftSub === item.slug ? "lime" : "outline"} aria-pressed={draftSub === item.slug}
                      className="px-3 text-xs" onClick={() => setDraftSub(item.slug)}>{item.label}</Button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-xs font-bold uppercase text-muted-foreground">Price range</legend>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <input type="number" aria-label="Filter minimum price" min={0} max={draftRange[1]} value={draftRange[0]}
                    onChange={(e) => setDraftRange([Math.max(0, Math.min(Number(e.target.value), draftRange[1])), draftRange[1]])}
                    className="h-12 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-base" />
                  <span className="text-muted-foreground">–</span>
                  <input type="number" aria-label="Filter maximum price" min={draftRange[0]} max={MAXP} value={draftRange[1]}
                    onChange={(e) => setDraftRange([draftRange[0], Math.min(MAXP, Math.max(Number(e.target.value), draftRange[0]))])}
                    className="h-12 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-base" />
                </div>
                <input type="range" aria-label="Filter maximum price slider" min={draftRange[0]} max={MAXP} step={50} value={draftRange[1]}
                  onChange={(e) => setDraftRange([draftRange[0], Number(e.target.value)])} className="mt-3 h-8 w-full accent-[var(--color-primary)]" />
                <p className="text-xs text-muted-foreground">{inr(draftRange[0])} — {inr(draftRange[1])}</p>
              </fieldset>
              <div>
                <label htmlFor="winter-mobile-sort" className="text-xs font-bold uppercase text-muted-foreground">Sort by</label>
                <select id="winter-mobile-sort" value={draftSort} onChange={(e) => setDraftSort(e.target.value as Sort)}
                  className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-base">
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
            </div>
            <div className="grid shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-border bg-surface px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="ghost" className="px-2 text-xs" onClick={() => { setDraftSub("all"); setDraftRange([0, MAXP]); setDraftSort("featured"); }}>Reset All</Button>
              <Button variant="lime" onClick={() => onApply(draftSub, draftRange, draftSort)} className="px-3 text-xs">Apply & Show {count} Items</Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, Card, ProductSkeleton, SectionTitle } from "@/components/ui/kit";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import type { CategorySlug } from "@/types";
import { inr } from "@/lib/storage";

type Sort = "featured" | "low" | "high" | "rating";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { category?: CategorySlug | "all" } => ({
    category: (typeof search["category"] === "string" ? search["category"] : "all") as CategorySlug | "all",
  }),
  head: () => ({
    meta: [
      { title: "Shop Custom Jerseys — All Over, Front & Back Print | Jersey Fit" },
      { name: "description", content: "Browse all over print, front print and back print sports jerseys. Filter by price, sort and customise with names, numbers and logos." },
      { property: "og:title", content: "Shop Custom Jerseys — Jersey Fit" },
      { property: "og:description", content: "All over print, front print and back print jerseys with live customisation." },
    ],
  }),
  component: Shop,
});

const PAGE = 8;
const MAXP = 1200;

function Shop() {
  const category = Route.useSearch().category ?? "all";
  const navigate = useNavigate();
  const [range, setRange] = useState<[number, number]>([0, MAXP]);
  const [sort, setSort] = useState<Sort>("featured");
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);

  // Simulated fetch — swap for GET /api/products?category=…
  useEffect(() => {
    setLoading(true);
    setVisible(PAGE);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [category, sort, range[0], range[1]]);

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => (category === "all" ? true : p.category === category));
    l = l.filter((p) => p.price >= range[0] && p.price <= range[1]);
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [category, range, sort]);

  const setCategory = (c: CategorySlug | "all") =>
    navigate({ to: "/shop", search: { category: c } });

  return (
    <div className="shell py-12">
      <SectionTitle kicker="Shop" title="Build your squad kit" sub="Pick a print style, then customise sizes, names and numbers." />

      {/* category pills */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {[{ slug: "all" as const, label: "All Jerseys" }, ...CATEGORIES].map((c) => (
          <button key={c.slug} onClick={() => setCategory(c.slug)}
            aria-pressed={category === c.slug}
            className={`h-11 rounded-full px-5 text-xs font-extrabold uppercase tracking-wide transition-all sm:text-sm ${
              category === c.slug ? "bg-heat text-primary-foreground glow" : "border border-border bg-surface/60 text-muted-foreground hover:text-foreground"
            }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* filters */}
        <Card className="h-fit lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-lime" /> Filters</h3>

          <div className="mt-5">
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
            <label htmlFor="sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="mt-2 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          <Button variant="outline" className="mt-6 w-full" onClick={() => { setRange([0, MAXP]); setSort("featured"); setCategory("all"); }}>
            Reset filters
          </Button>
        </Card>

        {/* grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : list.length === 0 ? (
            <Card className="py-16 text-center">
              <h3 className="text-xl">No jerseys match those filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try widening the price range or switching category.</p>
              <Button className="mt-5" onClick={() => { setRange([0, MAXP]); setCategory("all"); }}>Clear filters</Button>
            </Card>
          ) : (
            <>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {list.length} jersey{list.length > 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {list.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {visible < list.length ? (
                <div className="mt-10 text-center">
                  <Button size="lg" variant="lime" onClick={() => setVisible((v) => v + PAGE)}>Load more</Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

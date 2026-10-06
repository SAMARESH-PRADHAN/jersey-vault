import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import { Button, Card, ProductSkeleton } from "@/components/ui/kit";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, SHOP_CATEGORIES, TOP_WEAR_SUBCATEGORIES, getCategory } from "@/data/products";
import { MobileFilterSheet, type ShopFilters } from "@/components/MobileFilterSheet";
import type { CategorySlug, TopWearSubCategory } from "@/types";
import { inr } from "@/lib/storage";
import hero from "@/assets/hero-1.jpg";

type Sort = "featured" | "low" | "high" | "rating";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { category: CategorySlug | "all"; subCategory?: TopWearSubCategory } => {
    const requested = typeof search["category"] === "string" ? search["category"] : "all";
    const category = SHOP_CATEGORIES.some((item) => item.slug === requested) ? requested : "all";
    const requestedSub = typeof search["subCategory"] === "string" ? search["subCategory"] : "all";
    const subCategory: TopWearSubCategory = category === "top-wear" && (requestedSub === "round-neck" || requestedSub === "polo-neck") ? requestedSub : "all";
    return { category: category as CategorySlug | "all", subCategory: subCategory === "all" ? undefined : subCategory };
  },
  head: () => ({
    meta: [
      { title: "Shop Custom Jerseys — All Over, Front & Back Print | Jersey Fit" },
      { name: "description", content: "Browse all over print, front print and back print sports jerseys. Filter by price, sort and customise with names, numbers and logos." },
      { property: "og:title", content: "Shop Custom Jerseys — Jersey Fit" },
      { property: "og:description", content: "All over print, front print and back print jerseys with live customisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const PAGE = 8;
const MAXP = 2000;
const MATERIALS = Array.from(new Set(PRODUCTS.map((product) => product.material))).sort();

function Shop() {
  const category = Route.useSearch().category ?? "all";
  const subCategory = Route.useSearch().subCategory ?? "all";
  const navigate = Route.useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, MAXP]);
  const [sort, setSort] = useState<Sort>("featured");
  const [visible, setVisible] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<string[]>([]);

  // Simulated fetch — swap for GET /api/products?category=…
  useEffect(() => {
    setLoading(true);
    setVisible(PAGE);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [category, subCategory, sort, range[0], range[1], materials]);

  const list = useMemo(() => {
    let l = PRODUCTS.filter((p) => (category === "all" ? true : p.category === category));
    if (category === "top-wear" && subCategory !== "all") l = l.filter((p) => p.subCategory === subCategory);
    l = l.filter((p) => p.price >= range[0] && p.price <= range[1]);
    if (materials.length) l = l.filter((p) => materials.includes(p.material));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [category, subCategory, materials, range, sort]);

  const setCategory = (c: CategorySlug | "all") =>
    navigate({ to: ".", search: { category: c } });

  const currentCategory = getCategory(category);
  const banner = currentCategory ?? {
    label: "All Jersey Collections",
    image: hero,
    description: "Custom sports, community and ready-to-wear jerseys in one place.",
  };

  const toggleMaterial = (material: string) =>
    setMaterials((selected) => selected.includes(material) ? selected.filter((item) => item !== material) : [...selected, material]);

  const resetFilters = () => {
    setRange([0, MAXP]);
    setSort("featured");
    setMaterials([]);
    setCategory("all");
  };

  const filters: ShopFilters = { category, subCategory, range, sort, materials };
  const activeCount = (category !== "all" ? 1 : 0) + (subCategory !== "all" ? 1 : 0) + (range[0] !== 0 || range[1] !== MAXP ? 1 : 0) + materials.length + (sort !== "featured" ? 1 : 0);
  const applyFilters = (next: ShopFilters) => {
    setRange(next.range); setSort(next.sort); setMaterials(next.materials);
    navigate({ to: ".", search: { category: next.category, subCategory: next.category === "top-wear" && next.subCategory !== "all" ? next.subCategory : undefined } });
    setFilterOpen(false);
  };

  return (
    <div>
      <section className="relative min-h-[230px] lg:min-h-[330px] overflow-hidden border-b border-border">
        <img key={banner.image} src={banner.image} alt={`${banner.label} collection`} width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[230px] items-end py-8 lg:min-h-[330px] lg:py-12">
          <div className="max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Shop Collection</span><h1 className="mt-3 text-4xl sm:text-6xl">{banner.label}</h1><p className="mt-4 max-w-xl text-sm text-foreground/80 sm:text-base">{banner.description}</p></div>
        </div>
      </section>

      {category === "top-wear" ? <div className="shell flex flex-wrap gap-2 py-4">
        {TOP_WEAR_SUBCATEGORIES.map((sub) => <Button key={sub.slug} variant={subCategory === sub.slug ? "lime" : "outline"} aria-pressed={subCategory === sub.slug} className="px-3 text-xs"
          onClick={() => navigate({ to: ".", search: { category: "top-wear", subCategory: sub.slug === "all" ? undefined : sub.slug } })}>{sub.label}</Button>)}
      </div> : null}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-xl md:top-18 lg:hidden">
        <div className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
          <p className="min-w-0 text-xs font-bold text-muted-foreground" aria-live="polite">Showing {list.length} Jerseys</p>
          <Button variant="lime" className="gap-2 px-4 text-xs" onClick={() => setFilterOpen(true)}><SlidersHorizontal className="h-4 w-4 shrink-0" />Filter & Sort
            {activeCount ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-background text-foreground" aria-label={`${activeCount} active filters`}>{activeCount}</span> : null}
          </Button>
        </div>
      </div>
      {filterOpen ? <MobileFilterSheet initial={filters} onClose={() => setFilterOpen(false)} onApply={applyFilters} /> : null}
      <div className="shell py-6 lg:py-12">

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* filters */}
        <div className="hidden lg:block">
        <Card className="h-fit lg:sticky lg:top-24">
          <h3 className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-lime" /> Filters</h3>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
              {[{ slug: "all" as const, label: "All Jerseys" }, ...SHOP_CATEGORIES].map((item) => (
                <button key={item.slug} onClick={() => setCategory(item.slug)} aria-pressed={category === item.slug} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold ${category === item.slug ? "bg-primary/15 text-lime" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"}`}>
                  {item.label}{category === item.slug ? <Check className="h-3.5 w-3.5" /> : null}
                </button>
              ))}
            </div>
          </div>

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

          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Material</legend>
            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
              {MATERIALS.map((material) => (
                <label key={material} className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <input type="checkbox" checked={materials.includes(material)} onChange={() => toggleMaterial(material)} className="mt-0.5 accent-[var(--color-lime)]" />
                  <span>{material}</span>
                </label>
              ))}
            </div>
          </fieldset>

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

          <Button variant="outline" className="mt-6 w-full" onClick={resetFilters}>
            Reset filters
          </Button>
        </Card>
        </div>

        {/* grid */}
        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : list.length === 0 ? (
            <Card className="py-16 text-center">
              <h3 className="text-xl">No jerseys match those filters</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try widening the price range or switching category.</p>
              <Button className="mt-5" onClick={resetFilters}>Clear filters</Button>
            </Card>
          ) : (
            <>
              <p className="mb-4 hidden text-xs font-bold uppercase tracking-wider text-muted-foreground lg:block">
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
    </div>
  );
}

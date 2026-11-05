import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { Button, Card, ProductSkeleton } from "@/components/ui/kit";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilterList } from "@/components/CategoryFilterList";
import { MobileFilterSheet, type ShopFilters } from "@/components/MobileFilterSheet";
import { PRODUCTS, SHOP_FILTER_CATEGORIES, SHOP_MATERIALS } from "@/data/products";
import { inr } from "@/lib/storage";
import hero from "@/assets/hero-1.jpg";

type Sort = "featured" | "low" | "high" | "rating";

const MAXP = 2000;
const PREMIUM = PRODUCTS.filter((p) => p.category === "custom-premium");

export const Route = createFileRoute("/premium-collection")({
  head: () => ({
    meta: [
      { title: "Custom Premium Collection — Premium Fabrics, Fully Customisable | Jersey Fit" },
      { name: "description", content: "Jersey Fit's premium custom collection: heavyweight interlock and luxe mesh jerseys with sublimation, DTF, names, numbers and logo printing. MOQ 5 pieces." },
      { property: "og:title", content: "Custom Premium Collection — Jersey Fit" },
      { property: "og:description", content: "Premium fabrics with full customisation — sublimation, DTF, names, numbers and your logo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/premium-collection" }],
  }),
  component: PremiumCollection,
});

function PremiumCollection() {
  const navigate = Route.useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, MAXP]);
  const [sort, setSort] = useState<Sort>("featured");
  const [materials, setMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated fetch — swap for GET /api/products?collection=custom-premium later.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [sort, range[0], range[1], materials]);

  const list = useMemo(() => {
    let l = PREMIUM.filter((p) => p.price >= range[0] && p.price <= range[1]);
    if (materials.length) l = l.filter((p) => materials.includes(p.material));
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [range, sort, materials]);

  const toggleMaterial = (material: string) =>
    setMaterials((selected) => selected.includes(material) ? selected.filter((item) => item !== material) : [...selected, material]);

  const activeCount = (range[0] !== 0 || range[1] !== MAXP ? 1 : 0) + materials.length + (sort !== "featured" ? 1 : 0);
  const resetFilters = () => {
    setRange([0, MAXP]);
    setSort("featured");
    setMaterials([]);
  };

  const goToCategory = (slug: Exclude<ShopFilters["category"], "custom-premium">) =>
    navigate({ to: "/shop", search: { category: slug } });

  const filters: ShopFilters = { category: "custom-premium", subCategory: "all", range, sort, materials };
  const applyFilters = (next: ShopFilters) => {
    setRange(next.range); setSort(next.sort); setMaterials(next.materials);
    if (next.category !== "custom-premium") goToCategory(next.category);
    setFilterOpen(false);
  };

  return (
    <div>
      {/* banner */}
      <section className="relative min-h-[230px] overflow-hidden border-b border-border lg:min-h-[330px]">
        <img src={hero} alt="Custom Premium Collection banner" width={1600} height={900}
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[230px] items-end py-8 lg:min-h-[330px] lg:py-12">
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Premium Fabrics · Full Customisation</span>
            <h1 className="mt-3 text-4xl sm:text-6xl">Custom Premium <span className="text-gradient">Collection</span></h1>
            <p className="mt-4 max-w-xl text-sm text-foreground/80 sm:text-base">
              Our richest fabrics with complete customisation — sublimation or DTF printing, player names and numbers, your club logo. Minimum order 5 pieces.
            </p>
          </div>
        </div>
      </section>

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
      {filterOpen ? <MobileFilterSheet initial={filters} onClose={() => setFilterOpen(false)} onApply={applyFilters} /> : null}

      <div className="shell py-6 lg:py-12">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* filters — category, price, material, sort */}
          <div className="hidden lg:block">
            <Card className="h-fit lg:sticky lg:top-24">
              <h3 className="flex items-center gap-2 text-base"><SlidersHorizontal className="h-4 w-4 text-lime" /> Filters</h3>
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                <CategoryFilterList className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1"
                  categories={[{ slug: "all" as const, label: "All Jerseys" }, ...SHOP_FILTER_CATEGORIES]}
                  active="custom-premium"
                  onSelect={(slug) => { if (slug !== "custom-premium") goToCategory(slug); }} />
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
                  {SHOP_MATERIALS.map((material) => (
                    <label key={material} className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <input type="checkbox" checked={materials.includes(material)} onChange={() => toggleMaterial(material)} className="mt-0.5 accent-[var(--color-lime)]" />
                      <span>{material}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-6">
                <label htmlFor="premium-sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort by</label>
                <select id="premium-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                  className="mt-2 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm">
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="rating">Top rated</option>
                </select>
              </div>
              <p className="mt-6 rounded-xl border border-lime/40 bg-lime/10 p-3 text-xs font-bold text-lime">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />Fully customisable · MOQ: 5 pcs
              </p>
              <Button variant="outline" className="mt-4 w-full" onClick={resetFilters}>Reset filters</Button>
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
                <p className="mt-2 text-sm text-muted-foreground">Try widening the price range or clearing materials.</p>
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

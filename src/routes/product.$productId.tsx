import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileDown, FileUp, Minus, Plus, ShoppingCart, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Stars } from "@/components/ui/kit";
import { ProductCard } from "@/components/ProductCard";
import { ShareWidget } from "@/components/ShareWidget";
import { DESIGN_GUIDELINES, WASH_CARE } from "@/data/content";
import { inr, uid } from "@/lib/storage";
import { useApp } from "@/store/app";
import { SIZES, type PersonRow, type PrintCategory, type PrintType, type Size } from "@/types";
import { PRINT_CHARGES, PRODUCTS, getProduct, getQtyDiscountPct } from "@/data/products";
import { QtyDiscountList } from "@/components/QtyDiscountList";

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Jersey not found — Jersey Fit" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Jersey Fit` },
        { name: "description", content: `${p.name} (${p.code}) in ${p.material}. ${p.description}` },
        { property: "og:title", content: `${p.name} — Jersey Fit` },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

type Tab = "wash" | "overview" | "design";

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { user, openAuth, addToCart, productReviews } = useApp();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [printType, setPrintType] = useState<PrintType>("Sublimation Print");
  const [cats, setCats] = useState<PrintCategory[]>([]);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [rows, setRows] = useState<Record<string, { name: string; number: string }>>({});
  const [note, setNote] = useState("");
  const [rosterName, setRosterName] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("overview");
  const [errors, setErrors] = useState<string[]>([]);
  const railRef = useRef<HTMLDivElement>(null);
  const isTopWear = product.isExclusiveTopWear || product.category === "top-wear";

  useEffect(() => {
    setActive(0); setQty({}); setRows({}); setCats([]); setLogo(undefined); setNote(""); setRosterName(undefined);
    setPrintType(product.isExclusiveTopWear || product.category === "top-wear" ? "No Print" : "Sublimation Print");
  }, [product.category, product.id, product.isExclusiveTopWear]);

  const needsRows = cats.includes("Name") || cats.includes("Number");
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const perUnitPrint = isTopWear ? 0 : cats.reduce((s, c) => s + PRINT_CHARGES[c], 0);
  const discountPct = isTopWear ? 0 : getQtyDiscountPct(totalQty);
const productTotal = totalQty * product.price;
const discountAmt = Math.round((productTotal * discountPct) / 100);
const printTotal = totalQty * perUnitPrint;
const total = productTotal - discountAmt + printTotal;
const perPc = totalQty ? Math.round(total / totalQty) : 0;

  const rowKeys = useMemo(() => {
    const keys: { key: string; size: Size }[] = [];
    SIZES.forEach((s) => {
      for (let i = 0; i < (qty[s] ?? 0); i++) keys.push({ key: `${s}-${i}`, size: s });
    });
    return keys;
  }, [qty]);

  const reviews = productReviews(product.id);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating;
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 6);

  const toggleCat = (c: PrintCategory) =>
    setCats((l) => (l.includes(c) ? l.filter((x) => x !== c) : [...l, c]));

  const step = (s: Size, d: number) =>
    setQty((current) => {
      const next = Math.max(0, (current[s] ?? 0) + d);
      const otherTotal = Object.entries(current).reduce((sum, [size, amount]) => sum + (size === s ? 0 : amount), 0);
      return { ...current, [s]: isTopWear ? Math.min(next, Math.max(0, 3 - otherTotal)) : next };
    });

  const setSizeQuantity = (s: Size, value: number) => {
    const otherTotal = Object.entries(qty).reduce((sum, [size, amount]) => sum + (size === s ? 0 : amount), 0);
    const next = Math.max(0, value || 0);
    setQty({ ...qty, [s]: isTopWear ? Math.min(next, Math.max(0, 3 - otherTotal)) : next });
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Logo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  // Bulk roster upload — offered once the order exceeds 15 pieces.
  const onRoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/\.(csv|xlsx|xls|pdf)$/i.test(file.name)) {
      toast.error("Upload a CSV, Excel or PDF roster file.");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Roster file must be under 2 MB.");
      return;
    }
    if (file.name.toLowerCase().endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = () => {
        const lines = String(reader.result)
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(1); // skip the header row
        const next = { ...rows };
        rowKeys.forEach(({ key }, i) => {
          const cols = (lines[i] ?? "").split(",");
          if (cols.length >= 2 || (cols[0] ?? "").length > 0) {
            next[key] = {
              name: (cols[1] ?? "").trim(),
              number: (cols[2] ?? "").replace(/\D/g, "").slice(0, 2),
            };
          }
        });
        setRows(next);
        setRosterName(file.name);
        toast.success(`Roster attached — ${Math.min(lines.length, rowKeys.length)} players imported from CSV.`);
      };
      reader.readAsText(file);
    } else {
      // Excel / PDF rosters travel with the order as an attachment for production.
      setRosterName(file.name);
      toast.success("Roster file attached — our production team will print from it.");
    }
    e.target.value = "";
  };

  const downloadRosterTemplate = () => {
    const csv = ["Size,Name,Number", "S,Rahul,7", "M,Vikram,10", "L,Arjun,18", "XL,Sameer,3"].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "JerseyFit-Team-Roster-Template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const submit = () => {
    const errs: string[] = [];
    if (totalQty === 0) errs.push("Select at least one size and quantity.");
    if (isTopWear && totalQty > 3) errs.push("Exclusive Top Wear is limited to 3 pieces per order.");
    if (!isTopWear && cats.includes("Logo") && !logo) errs.push("Upload a logo image or uncheck Logo.");
    if (!isTopWear && needsRows && !rosterName) {
      const missing = rowKeys.some(({ key }) => {
        const r = rows[key];
        if (cats.includes("Name") && !r?.name?.trim()) return true;
        if (cats.includes("Number") && !r?.number?.trim()) return true;
        return false;
      });
      if (missing) errs.push("Fill in the name and number for every unit, or upload a team roster instead.");
    }
    setErrors(errs);
    if (errs.length) {
      toast.error(errs[0] ?? "Please check your selection.");
      return;
    }

    if (!user) {
      openAuth(`/product/${product.id}`);
      return;
    }

    const personRows: PersonRow[] = !isTopWear && needsRows
      ? rowKeys.map(({ key, size }) => ({
          key, size,
          name: rows[key]?.name?.trim() ?? "",
          number: rows[key]?.number?.trim() ?? "",
        }))
      : [];

    addToCart({
      id: uid("ci"),
      productId: product.id,
      name: product.name,
      code: product.code,
      image: product.images[0] ?? "",
      unitPrice: product.price + perUnitPrint,
      printType: isTopWear ? "No Print" : printType,
      printCategories: isTopWear ? [] : cats,
      ...(!isTopWear && logo ? { logo } : {}),
      ...(rosterName ? { rosterName } : {}),
      sizes: SIZES.filter((s) => (qty[s] ?? 0) > 0).map((s) => ({ size: s, qty: qty[s] ?? 0 })),
      rows: personRows,
      note,
      totalQty,
      lineTotal: total,
            discountPct,
      productSubtotal: productTotal,
      discountAmount: discountAmt,
      printTotal,
      perPiece: perPc,
    });
    navigate({ to: "/cart" });
  };

  const scrollRail = (d: number) => railRef.current?.scrollBy({ left: d * 280, behavior: "smooth" });

  return (
    <div className="shell relative pt-6 pb-28 lg:py-10">
      {/* Share button — top right */}
<div className="mb-4 flex justify-end">
  <ShareWidget name={product.name} code={product.code} />
</div>
      <nav className="mb-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> / <Link to="/shop" search={{ category: "all" }} className="hover:text-foreground">Shop</Link> / <span className="text-lime">{product.code}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <button onClick={() => setZoom((z) => !z)} aria-label="Toggle image zoom"
            className="panel block w-full overflow-hidden p-0">
            <img src={product.images[active]} alt={`${product.name} view ${active + 1}`} width={1024} height={1024}
              className={`aspect-square w-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : "scale-100"}`} />
          </button>
          
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
                className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-border"}`}>
                <img src={src} alt="" loading="lazy" width={200} height={200} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
          {!isTopWear ? <QtyDiscountList qty={totalQty} className="mt-4 hidden lg:block" /> : null}
        </div>

        {/* config */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{product.code}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={avg} size={16} />
            <span className="text-xs text-muted-foreground">{avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="display text-3xl text-gradient">{inr(product.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
            <span className="text-xs font-black uppercase text-lime">per piece</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Material: <span className="text-foreground">{product.material}</span></p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">MOQ: <span className="text-lime">{isTopWear ? "1 pc (Max: 3 pcs)" : "5 pcs"}</span> · per piece</p>
          {!isTopWear ? <QtyDiscountList qty={totalQty} className="mt-4 lg:hidden" /> : null}
          {isTopWear ? <span className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-xs font-black uppercase tracking-wider text-accent-foreground">Exclusive Ready-to-Wear</span> : null}

          {/* print type */}
          {!isTopWear ? <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Print type</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["Sublimation Print", "DTF Print", "No Print"] as PrintType[]).map((t) => (
                <label key={t} className={`cursor-pointer rounded-xl border-2 p-3 text-sm font-bold ${printType === t ? "border-primary bg-primary/10" : "border-border"}`}>
                  <input type="radio" name="printType" value={t} checked={printType === t}
                    onChange={() => {
                      setPrintType(t);
                      if (t === "No Print") {
                        // No print = plain jersey: drop every add-on and per-piece data.
                        setCats([]);
                        setLogo(undefined);
                      }
                    }} className="mr-2 accent-[var(--color-primary)]" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset> : null}

          {/* print category — hidden entirely for No Print */}
          {!isTopWear && printType !== "No Print" ? (
            <fieldset className="mt-5">
              <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Print category (add-ons)</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["Logo", "Name", "Number"] as PrintCategory[]).map((c) => (
                  <label key={c} className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold ${cats.includes(c) ? "border-lime bg-lime/10 text-lime" : "border-border"}`}>
                    <input type="checkbox" checked={cats.includes(c)} onChange={() => toggleCat(c)} className="mr-2 accent-[var(--color-lime)]" />
                    {c} +{inr(PRINT_CHARGES[c])}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-lime">Plain jersey — no print add-ons.</p>
          )}

          {/* logo upload */}
          {!isTopWear && printType !== "No Print" && cats.includes("Logo") ? (
            <div className="mt-5 panel p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upload logo — applies to all sizes</p>
              <div className="mt-3 flex items-center gap-4">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-sm font-extrabold uppercase">
                  <Upload className="h-4 w-4" /> Choose file
                  <input type="file" accept="image/*" className="sr-only" onChange={onLogo} />
                </label>
                {logo ? (
                  <span className="relative">
                    <img src={logo} alt="Logo preview" className="h-16 w-16 rounded-xl border border-border bg-background object-contain p-1" />
                    <button onClick={() => setLogo(undefined)} aria-label="Remove logo"
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : <span className="text-xs text-muted-foreground">PNG with transparent background works best.</span>}
              </div>
            </div>
          ) : null}

          {/* sizes */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sizes & quantity</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SIZES.map((s) => {
                const n = qty[s] ?? 0;
                return (
                  <div key={s} className="self-start rounded-xl border border-border bg-surface/50 p-2">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1">
                      <span className="text-sm font-extrabold">{s}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <button onClick={() => step(s, -1)} aria-label={`Decrease ${s} quantity`}
                          className="grid h-11 w-11 place-items-center sm:h-8 sm:w-8 rounded-full border border-border"><Minus className="h-3 w-3" /></button>
                        <input aria-label={`${s} quantity`} value={n} inputMode="numeric"
                          onChange={(e) => setSizeQuantity(s, Number(e.target.value))}
                          className="h-11 w-12 rounded-lg sm:h-8 border border-input bg-background/60 text-center text-sm" />
                        <button onClick={() => step(s, 1)} aria-label={`Increase ${s} quantity`}
                          className="grid h-11 w-11 place-items-center sm:h-8 sm:w-8 rounded-full bg-heat text-primary-foreground"><Plus className="h-3 w-3" /></button>
                      </span>
                    </div>
                    {/* player rows for this size — shown directly under its counter */}
                    {!isTopWear && printType !== "No Print" && needsRows && n > 0 ? (
                      <div className="mt-2 space-y-1.5 border-t border-border pt-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Player details for {s} — {n} piece{n > 1 ? "s" : ""}
                        </p>
                        {Array.from({ length: n }, (_, i) => {
                          const key = `${s}-${i}`;
                          return (
                            <div key={key} className="grid grid-cols-[24px_minmax(0,1fr)_64px] items-center gap-2">
                              <span className="text-xs font-black text-muted-foreground">{i + 1}.</span>
                              {cats.includes("Name") ? (
                                <input placeholder="Player name" aria-label={`Name for ${s} piece ${i + 1}`} maxLength={14}
                                  value={rows[key]?.name ?? ""}
                                  onChange={(e) => setRows({ ...rows, [key]: { number: rows[key]?.number ?? "", name: e.target.value } })}
                                  className="h-12 w-full rounded-lg text-base sm:h-9 sm:text-sm border border-input bg-background/60 px-3 text-sm" />
                              ) : <span className="text-xs text-muted-foreground">— no name —</span>}
                              {cats.includes("Number") ? (
                                <input placeholder="No." aria-label={`Number for ${s} piece ${i + 1}`} maxLength={2} inputMode="numeric"
                                  value={rows[key]?.number ?? ""}
                                  onChange={(e) => setRows({ ...rows, [key]: { name: rows[key]?.name ?? "", number: e.target.value.replace(/\D/g, "") } })}
                                  className="h-12 w-full rounded-lg text-base sm:h-9 sm:text-sm border border-input bg-background/60 px-2 text-center text-sm" />
                              ) : <span />}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm font-extrabold">Total quantity: <span className="text-lime">{totalQty}</span></p>
            {isTopWear ? (
              <p className="mt-2 rounded-xl border border-accent/50 bg-accent/10 p-3 text-xs font-bold text-accent">Exclusive Top Wear: Maximum 3 pieces per order</p>
            ) : printType === "No Print" ? (
              <p className="mt-1 text-xs text-muted-foreground">Player details are not needed for plain (no print) jerseys.</p>
            ) : null}
          </div>

          {/* bulk roster upload — shown once the order exceeds 15 pieces */}
          {!isTopWear && printType !== "No Print" && needsRows && totalQty > 15 ? (
            <div className="panel mt-5 border-lime/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Big squad? Upload your team roster</p>
                <span className="rounded-full bg-lime px-2.5 py-1 text-[10px] font-black uppercase text-lime-foreground">{totalQty} pcs</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                For orders above 15 pieces you can skip typing names and numbers — upload your roster (Excel, CSV or PDF) and our team prints straight from it.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-heat px-5 text-sm font-extrabold uppercase text-primary-foreground">
                  <FileUp className="h-4 w-4" /> Upload roster
                  <input type="file" accept=".csv,.xlsx,.xls,.pdf" className="sr-only" onChange={onRoster} />
                </label>
                <Button variant="outline" className="gap-2" onClick={downloadRosterTemplate}>
                  <FileDown className="h-4 w-4 text-lime" /> Sample CSV
                </Button>
                {rosterName ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-lime/50 bg-lime/10 px-3 py-2 text-xs font-bold text-lime">
                    <span className="max-w-40 truncate">{rosterName}</span>
                    <button onClick={() => setRosterName(undefined)} aria-label="Remove roster file" className="hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* note */}
          <div className="mt-5">
            <label htmlFor="note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Note for our team</label>
            <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Match date, colour tweaks, sponsor placement…"
              className="mt-2 w-full rounded-xl border border-input bg-background/60 p-3 text-sm" />
          </div>

          {/* bill */}
          <Card className="mt-6">
            
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live total bill</p>
<dl className="mt-3 space-y-2 text-sm">
  <div className="flex justify-between gap-4">
    <dt className="text-muted-foreground">Product ({totalQty} × {inr(product.price)})</dt>
    <dd className="shrink-0 text-right font-bold">{inr(productTotal)}</dd>
  </div>

  {discountPct ? (
    <>
      <div className="flex justify-between gap-4">
        <dt className="text-lime">Bulk discount ({discountPct}%)</dt>
        <dd className="shrink-0 text-right font-bold text-lime">− {inr(discountAmt)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Product after discount</dt>
        <dd className="shrink-0 text-right font-bold">{inr(productTotal - discountAmt)}</dd>
      </div>
    </>
  ) : null}

  {printTotal ? (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">Print ({totalQty} × {inr(perUnitPrint)})</dt>
      <dd className="shrink-0 text-right font-bold">{inr(printTotal)}</dd>
    </div>
  ) : null}

  <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
    <dt className="text-sm font-extrabold uppercase">Total</dt>
    <dd className="display shrink-0 text-right text-3xl text-gradient">{inr(total)}</dd>
  </div>

  {totalQty ? (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">Per piece ({inr(total)} ÷ {totalQty})</dt>
      <dd className="shrink-0 text-right font-bold text-lime">{inr(perPc)}/pc</dd>
    </div>
  ) : null}
</dl>
              
            {errors.length ? (
              <ul className="mt-3 space-y-1 text-xs font-semibold text-destructive">
                {errors.map((e) => <li key={e}>• {e}</li>)}
              </ul>
            ) : null}
            <Button size="lg" className="mt-4 w-full" onClick={submit}>
              <ShoppingCart className="h-4 w-4" /> {user ? "Add to Cart" : "Login & Add to Cart"}
            </Button>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0" aria-live="polite"><p className="text-[10px] font-bold uppercase text-muted-foreground">Total · {totalQty} pieces</p><p className="display truncate text-2xl text-lime">{inr(total)}</p></div>
          <Button onClick={submit} aria-label="Mobile Add to Cart" className="px-5"><ShoppingCart className="h-4 w-4" />Add to Cart</Button>
        </div>
      </div>

      {/* tabs */}
      <section className="mt-16">
        <div className="flex flex-wrap gap-2">
          {([["overview", "Product Overview"], ["wash", "Wash Care"], ["design", "Design Guidelines"]] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k}
              className={`h-11 rounded-full px-5 text-xs font-extrabold uppercase tracking-wide sm:text-sm ${tab === k ? "bg-heat text-primary-foreground" : "border border-border text-muted-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
        <Card className="mt-4">
          {tab === "overview" ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{product.description}</p>
              <p>Fabric: {product.material}. Fit: regular athletic. Neck: rib crew. Sleeve: short set-in.</p>
              <p>Printed and stitched at our Tirupur unit with a 9-point quality check before dispatch.</p>
            </div>
          ) : null}
          {tab === "wash" ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {WASH_CARE.map((w) => <li key={w}>• {w}</li>)}
            </ul>
          ) : null}
          {tab === "design" ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {DESIGN_GUIDELINES.map((d) => <li key={d}>• {d}</li>)}
            </ul>
          ) : null}
        </Card>
      </section>

      {/* reviews */}
      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl">Product <span className="text-gradient">Reviews</span></h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
          <Card className="text-center">
            <span className="display text-5xl text-gradient">{avg.toFixed(1)}</span>
            <div className="mt-2 flex justify-center"><Stars rating={avg} size={18} /></div>
            <p className="mt-2 text-xs text-muted-foreground">{reviews.length} verified review{reviews.length === 1 ? "" : "s"}</p>
          </Card>
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <Card className="text-sm text-muted-foreground">No reviews yet for this jersey. Order it and be the first.</Card>
            ) : reviews.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold">{r.user}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="mt-1"><Stars rating={r.rating} /></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* related */}
      {related.length ? (
        <section className="mt-16">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <h2 className="text-2xl sm:text-3xl">Related <span className="text-gradient">Jerseys</span></h2>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => scrollRail(-1)} aria-label="Scroll left" className="grid h-10 w-10 place-items-center rounded-full border border-border"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => scrollRail(1)} aria-label="Scroll right" className="grid h-10 w-10 place-items-center rounded-full border border-border"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
          <div ref={railRef} className="mt-5 flex snap-x gap-4 overflow-x-auto pb-4">
            {related.map((p) => (
              <motion.div key={p.id} className="w-56 shrink-0 snap-start sm:w-64">
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

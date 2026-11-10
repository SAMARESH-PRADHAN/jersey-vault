import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingCart, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Stars } from "@/components/ui/kit";
import { ShareWidget } from "@/components/ShareWidget";
import { DESIGN_GUIDELINES, WASH_CARE } from "@/data/content";
import {
  CUSTOM_TSHIRT_MOQ,
  CUSTOM_TSHIRT_OPTIONS,
  CUSTOM_TSHIRT_PRODUCT,
  getQtyDiscountPct,
} from "@/data/products";
import { QtyDiscountList } from "@/components/QtyDiscountList";
import { inr, uid } from "@/lib/storage";
import { useApp } from "@/store/app";
import { SIZES, type PrintType, type Size } from "@/types";

export const Route = createFileRoute("/custom-tshirt-design")({
  head: () => ({
    meta: [
      { title: "Custom T-Shirt Design — Upload Your Own Design | Jersey Fit" },
      {
        name: "description",
        content:
          "Upload your own design and get it printed on a jersey: front print, front & back print or all over print. Live pricing, sizes and bulk quantities.",
      },
      { property: "og:title", content: "Custom T-Shirt Design — Jersey Fit" },
      { property: "og:description", content: "Upload your design, pick a print style and order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/custom-tshirt-design" }],
  }),
  component: CustomTshirtDesign,
});

type Tab = "overview" | "wash" | "design";

function CustomTshirtDesign() {
  const product = CUSTOM_TSHIRT_PRODUCT;
  const { user, openAuth, addToCart, productReviews } = useApp();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [optionType, setOptionType] = useState<PrintType>(CUSTOM_TSHIRT_OPTIONS[0]!.type);
  const [design, setDesign] = useState<string | undefined>(undefined);
  const [designName, setDesignName] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [errors, setErrors] = useState<string[]>([]);

  const selected =
    CUSTOM_TSHIRT_OPTIONS.find((o) => o.type === optionType) ?? CUSTOM_TSHIRT_OPTIONS[0]!;
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const discountPct = getQtyDiscountPct(totalQty);
  const productTotal = totalQty * selected.price;
  const discountAmt = Math.round((productTotal * discountPct) / 100);
  const total = productTotal - discountAmt;
  const perPc = totalQty ? Math.round(total / totalQty) : 0;

  const reviews = productReviews(product.id);
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;

  const step = (s: Size, d: number) => setQty((c) => ({ ...c, [s]: Math.max(0, (c[s] ?? 0) + d) }));
  const setSizeQuantity = (s: Size, v: number) =>
    setQty((c) => ({ ...c, [s]: Math.max(0, v || 0) }));

  const onDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG or JPG).");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Design must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDesign(String(reader.result));
      setDesignName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const submit = () => {
    const errs: string[] = [];
    if (!design) errs.push("Upload your design image to continue.");
    if (totalQty === 0) errs.push("Select at least one size and quantity.");
    else if (totalQty < CUSTOM_TSHIRT_MOQ)
      errs.push(`Minimum order is ${CUSTOM_TSHIRT_MOQ} pieces.`);
    setErrors(errs);
    if (errs.length) {
      toast.error(errs[0] ?? "Please check your selection.");
      return;
    }
    if (!design) return;
    if (!user) {
      openAuth("/custom-tshirt-design");
      return;
    }
    addToCart({
      id: uid("ci"),
      productId: product.id,
      name: `${product.name} — ${selected.type}`,
      code: product.code,
      image: product.images[0] ?? "",
      unitPrice: selected.price,
      printType: selected.type,
      printCategories: [],
      logo: design,
      sizes: SIZES.filter((s) => (qty[s] ?? 0) > 0).map((s) => ({ size: s, qty: qty[s] ?? 0 })),
      rows: [],
      note,
      totalQty,
      lineTotal: total,
      discountPct,
      productSubtotal: productTotal,
      discountAmount: discountAmt,
      printTotal: 0,
      perPiece: perPc,
    });
    navigate({ to: "/cart" });
  };

  return (
    <div className="shell relative pt-6 pb-28 lg:py-10">
      {/* Share button — top left */}
      <div className="mb-4 flex justify-end">
        <ShareWidget name={product.name} code={product.code} />
      </div>
      <nav className="mb-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        / <span className="text-lime">Custom T-Shirt Design</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div>
          <button
            onClick={() => setZoom((z) => !z)}
            aria-label="Toggle image zoom"
            className="panel block w-full overflow-hidden p-0"
          >
            <img
              src={product.images[active]}
              alt={`${product.name} view ${active + 1}`}
              width={1024}
              height={1024}
              className={`aspect-square w-full object-cover transition-transform duration-500 ${zoom ? "scale-150" : "scale-100"}`}
            />
          </button>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-border"}`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  width={200}
                  height={200}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
          <QtyDiscountList qty={totalQty} className="mt-4 hidden lg:block" />
        </div>

        {/* config */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {product.code}
          </p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Stars rating={avg} size={16} />
            <span className="text-xs text-muted-foreground">
              {avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="display text-3xl text-gradient">{inr(selected.price)}</span>
            <span className="text-sm text-muted-foreground line-through">{inr(selected.mrp)}</span>
            <span className="text-xs font-black uppercase text-lime">per piece</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Material: <span className="text-foreground">{product.material}</span>
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            MOQ: <span className="text-lime">{CUSTOM_TSHIRT_MOQ} pcs</span> · per piece
          </p>
          {/* <ShareWidget name={product.name} code={product.code} /> */}
          <QtyDiscountList qty={totalQty} className="mt-4 lg:hidden" />
          {/* UPLOAD YOUR OWN DESIGN T-SHIRT */}
          <section className="panel mt-6 border-lime/40 p-5">
            <h2 className="text-xl">
              Upload your own <span className="text-gradient">design T-shirt</span>
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a print style — the price per piece changes with your choice.
            </p>

            <fieldset className="mt-4">
              <legend className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Print type
              </legend>
              <div className="mt-2 grid gap-3">
                {CUSTOM_TSHIRT_OPTIONS.map((o) => (
                  <label
                    key={o.type}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 ${optionType === o.type ? "border-primary bg-primary/10" : "border-border"}`}
                  >
                    <span className="flex min-w-0 items-start gap-2">
                      <input
                        type="radio"
                        name="tshirtPrint"
                        value={o.type}
                        checked={optionType === o.type}
                        onChange={() => setOptionType(o.type)}
                        className="mt-1 accent-[var(--color-primary)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold">{o.type}</span>
                        <span className="block text-xs text-muted-foreground">{o.text}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="display block text-xl text-gradient">{inr(o.price)}</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        per piece
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Upload design
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border-2 border-dashed border-border p-4">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-heat px-5 text-sm font-extrabold uppercase text-primary-foreground">
                  <Upload className="h-4 w-4" /> {design ? "Change design" : "Choose design"}
                  <input type="file" accept="image/*" className="sr-only" onChange={onDesign} />
                </label>
                {design ? (
                  <span className="relative">
                    <img
                      src={design}
                      alt="Your uploaded design"
                      className="h-20 w-20 rounded-xl border border-border bg-background object-contain p-1"
                    />
                    <button
                      onClick={() => {
                        setDesign(undefined);
                        setDesignName("");
                      }}
                      aria-label="Remove design"
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    PNG / JPG, max 2 MB. High resolution (300 DPI) prints best.
                  </span>
                )}
                {designName ? (
                  <span className="max-w-full truncate text-xs font-bold text-lime">
                    {designName}
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {/* sizes */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Sizes & quantity
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SIZES.map((s) => {
                const n = qty[s] ?? 0;
                return (
                  <div
                    key={s}
                    className="self-start rounded-xl border border-border bg-surface/50 p-2"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1">
                      <span className="text-sm font-extrabold">{s}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => step(s, -1)}
                          aria-label={`Decrease ${s} quantity`}
                          className="grid h-11 w-11 place-items-center rounded-full border border-border sm:h-8 sm:w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          aria-label={`${s} quantity`}
                          value={n}
                          inputMode="numeric"
                          onChange={(e) => setSizeQuantity(s, Number(e.target.value))}
                          className="h-11 w-12 rounded-lg border border-input bg-background/60 text-center text-sm sm:h-8"
                        />
                        <button
                          onClick={() => step(s, 1)}
                          aria-label={`Increase ${s} quantity`}
                          className="grid h-11 w-11 place-items-center rounded-full bg-heat text-primary-foreground sm:h-8 sm:w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-sm font-extrabold">
              Total quantity: <span className="text-lime">{totalQty}</span>
            </p>
          </div>

          {/* note */}
          <div className="mt-5">
            <label
              htmlFor="ct-note"
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >
              Note for our team
            </label>
            <textarea
              id="ct-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Colour tweaks, print placement, back design details…"
              className="mt-2 w-full rounded-xl border border-input bg-background/60 p-3 text-sm"
            />
          </div>

          {/* bill */}
          <Card className="mt-6">
            {/* <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live total bill
                </p>
                <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>
                    {selected.type}: {totalQty} × {inr(selected.price)} = {inr(productTotal)}
                  </p>
                  {discountPct ? (
                    <p className="font-bold text-lime">
                      Bulk discount ({discountPct}%): − {inr(discountAmt)}
                    </p>
                  ) : null}
                  {totalQty ? (
                    <p className="font-bold text-foreground">
                      Final: {inr(total)} ÷ {totalQty} = {inr(perPc)}/pc
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="display text-3xl text-gradient">{inr(total)}</span>
            </div> */}

            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live total bill</p>
<dl className="mt-3 space-y-2 text-sm">
  <div className="flex justify-between gap-4">
    <dt className="text-muted-foreground">{selected.type} ({totalQty} × {inr(selected.price)})</dt>
    <dd className="shrink-0 text-right font-bold">{inr(productTotal)}</dd>
  </div>

  {discountPct ? (
    <>
      <div className="flex justify-between gap-4">
        <dt className="text-lime">Bulk discount ({discountPct}%)</dt>
        <dd className="shrink-0 text-right font-bold text-lime">− {inr(discountAmt)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Price after discount</dt>
        <dd className="shrink-0 text-right font-bold">{inr(productTotal - discountAmt)}</dd>
      </div>
    </>
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
                {errors.map((e) => (
                  <li key={e}>• {e}</li>
                ))}
              </ul>
            ) : null}
            <Button size="lg" className="mt-4 w-full" onClick={submit}>
              <ShoppingCart className="h-4 w-4" /> {user ? "Add to Cart" : "Login & Add to Cart"}
            </Button>
          </Card>
        </div>
      </div>

      {/* mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0" aria-live="polite">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">
              Total · {totalQty} pieces
            </p>
            <p className="display truncate text-2xl text-lime">{inr(total)}</p>
          </div>
          <Button onClick={submit} aria-label="Mobile Add to Cart" className="px-5">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* tabs */}
      <section className="mt-16">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["overview", "Product Overview"],
              ["wash", "Wash Care"],
              ["design", "Design Guidelines"],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              aria-pressed={tab === k}
              className={`h-11 rounded-full px-5 text-xs font-extrabold uppercase tracking-wide sm:text-sm ${tab === k ? "bg-heat text-primary-foreground" : "border border-border text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Card className="mt-4">
          {tab === "overview" ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>{product.description}</p>
              <p>
                Fabric: {product.material}. Fit: regular athletic. Neck: rib crew. Sleeve: short
                set-in.
              </p>
              <p>
                Printed and stitched at our Tirupur unit with a 9-point quality check before
                dispatch.
              </p>
            </div>
          ) : null}
          {tab === "wash" ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {WASH_CARE.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          ) : null}
          {tab === "design" ? (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {DESIGN_GUIDELINES.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      </section>

      {/* reviews */}
      <section className="mt-16">
        <h2 className="text-2xl sm:text-3xl">
          Customer <span className="text-gradient">Reviews</span>
        </h2>
        <div className="mt-5 space-y-3">
          {reviews.length === 0 ? (
            <Card className="text-sm text-muted-foreground">
              No reviews yet for this design service. Order it and be the first.
            </Card>
          ) : (
            reviews.map((r) => (
              <Card key={r.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold">{r.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="mt-1">
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

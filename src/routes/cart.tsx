import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui/kit";
import { COUPONS, GST_RATE, useApp } from "@/store/app";
import { inr } from "@/lib/storage";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Jersey Fit" },
      { name: "description", content: "Review your custom jersey order, apply a coupon and see GST before checkout." },
      { property: "og:title", content: "Your Cart — Jersey Fit" },
      { property: "og:description", content: "Custom jersey cart with coupons and GST breakdown." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, removeFromCart, coupon, applyCoupon, removeCoupon, totals, user, openAuth } = useApp();
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const placeOrder = () => {
    if (!user) return openAuth("/checkout");
    navigate({ to: "/checkout" });
  };

  if (!cart.length) {
    return (
      <div className="shell py-24">
        <Card className="mx-auto max-w-lg py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-lime" />
          <h1 className="mt-4 text-2xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add a jersey and customise it with names, numbers and your logo.</p>
          <Link to="/shop" search={{ category: "all" }}><Button size="lg" className="mt-6">Start shopping</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="shell py-12">
      <h1 className="text-3xl sm:text-4xl">Your <span className="text-gradient">Cart</span></h1>
      <p className="mt-1 text-sm text-muted-foreground">{cart.length} design{cart.length > 1 ? "s" : ""} · {totals.subtotal > 0 ? inr(totals.subtotal) : ""} before tax</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-4">
          {cart.map((item) => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="grid grid-cols-[88px_minmax(0,1fr)_auto] gap-4">
                  <Link to="/product/$productId" params={{ productId: item.productId }} className="group block w-22" aria-label={`View ${item.name}`}>
                    <img src={item.image} alt={item.name} loading="lazy" width={200} height={200}
                      className="aspect-square w-full rounded-xl border border-border object-cover transition group-hover:border-primary" />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.code}</p>
                    <Link to="/product/$productId" params={{ productId: item.productId }}
                      className="block truncate text-sm font-extrabold normal-case tracking-normal transition hover:text-primary"
                      style={{ fontFamily: "var(--font-sans)" }}>{item.name}</Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.printType}
                      {item.printCategories.length ? ` · ${item.printCategories.join(", ")}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.sizes.map((s) => `${s.size}×${s.qty}`).join("  ")} · <span className="text-lime">{item.totalQty} pcs</span>
                    </p>
                    {item.logo ? (
                      <img src={item.logo} alt="Uploaded logo" className="mt-2 h-10 w-10 rounded-lg border border-border bg-background object-contain p-1" />
                    ) : null}
                    {item.rows.length ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-accent">
                          {item.rows.length} name/number rows
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                          {item.rows.map((r) => (
                            <li key={r.key}>{r.size} — {r.name || "—"} {r.number ? `#${r.number}` : ""}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                    {item.rosterName ? (
                      <p className="mt-2 text-xs font-bold text-accent">Team roster attached: {item.rosterName}</p>
                    ) : null}
                    {item.note ? <p className="mt-2 text-xs italic text-muted-foreground">Note: {item.note}</p> : null}
                  </div>
                  <div className="flex flex-col items-end justify-between gap-2">
                    <span className="display text-lg text-gradient">{inr(item.lineTotal)}</span>
                    <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}
                      className="grid h-10 w-10 place-items-center rounded-full border border-border text-destructive hover:bg-surface-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* bill */}
        <Card className="lg:sticky lg:top-24">
          <h2 className="text-lg">Bill summary</h2>

          <div className="mt-4">
            <label htmlFor="coupon" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Coupon code</label>
            {coupon ? (
              <div className="mt-2 flex items-center justify-between rounded-xl border border-lime/60 bg-lime/10 px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-extrabold text-lime"><Tag className="h-4 w-4" /> {coupon.code}</span>
                <button onClick={removeCoupon} className="text-xs font-bold uppercase text-destructive">Remove</button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="JERSEY100"
                  className="h-11 w-full rounded-xl border border-input bg-background/60 px-4 text-sm" />
                <Button onClick={() => applyCoupon(code) && setCode("")}>Apply</Button>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Try: {COUPONS.map((c) => c.code).join(", ")}
            </p>
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-bold">{inr(totals.subtotal)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Coupon discount</dt>
              <dd className="font-bold text-lime">{totals.discount ? `− ${inr(totals.discount)}` : "—"}</dd>
            </div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST ({GST_RATE * 100}%)</dt><dd className="font-bold">{inr(totals.gst)}</dd></div>
            <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
              <dt className="text-sm font-extrabold uppercase">Grand total</dt>
              <dd className="display text-2xl text-gradient">{inr(totals.total)}</dd>
            </div>
          </dl>

          <Button size="lg" className="mt-6 w-full" onClick={placeOrder}>
            {user ? "Place Order" : "Login to place order"}
          </Button>
          <Link to="/shop" search={{ category: "all" }} className="mt-3 block text-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Continue shopping
          </Link>
        </Card>
      </div>
    </div>
  );
}

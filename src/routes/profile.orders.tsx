import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, FastForward, Package, Star } from "lucide-react";
import { Button, Card, Modal, Stars } from "@/components/ui/kit";
import { RequireAuth } from "@/components/RequireAuth";
import { useApp } from "@/store/app";
import { downloadInvoice } from "@/lib/invoice";
import { inr } from "@/lib/storage";
import { ORDER_STATUSES, type Order } from "@/types";

export const Route = createFileRoute("/profile/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Jersey Fit" },
      { name: "description", content: "Track your Jersey Fit orders, download GST invoices and review delivered jerseys." },
      { property: "og:title", content: "My Orders — Jersey Fit" },
      { property: "og:description", content: "Order tracking, invoices and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth title="Login to see your orders">
      <Orders />
    </RequireAuth>
  ),
});

function Timeline({ index }: { index: number }) {
  return (
    <ol className="mt-4 grid grid-cols-5 gap-1">
      {ORDER_STATUSES.map((s, i) => (
        <li key={s} className="text-center">
          <div className="relative flex items-center justify-center">
            <span className={`z-1 h-4 w-4 rounded-full ${i <= index ? "bg-lime" : "bg-muted"}`} />
            {i < ORDER_STATUSES.length - 1 ? (
              <span className={`absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${i < index ? "bg-lime" : "bg-border"}`} />
            ) : null}
          </div>
          <p className={`mt-2 text-[9px] font-black uppercase leading-tight sm:text-[10px] ${i <= index ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
        </li>
      ))}
    </ol>
  );
}

function Orders() {
  const { orders, advanceOrder, addReview, user } = useApp();
  const [review, setReview] = useState<{ order: Order; productId: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  // Demo status progression: each pending order advances a step every 25s.
  useEffect(() => {
    const t = setInterval(() => {
      orders.filter((o) => o.statusIndex < 4).forEach((o) => advanceOrder(o.id));
    }, 25000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  if (!orders.length) {
    return (
      <div className="shell py-24">
        <Card className="mx-auto max-w-lg py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-accent" />
          <h1 className="mt-4 text-2xl">No orders yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your custom kits will show up here with live tracking.</p>
          <Link to="/shop"><Button size="lg" className="mt-6">Shop jerseys</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="shell py-12">
      <h1 className="text-3xl sm:text-4xl">My <span className="text-gradient">Orders</span></h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} order{orders.length > 1 ? "s" : ""} · status advances automatically every 25 seconds</p>

      <div className="mt-8 space-y-5">
        {orders.map((o) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order ID</p>
                  <p className="truncate text-lg font-extrabold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.date).toLocaleString("en-IN")} · {o.payment}
                  </p>
                </div>
                <div className="text-right">
                  <span className="display text-2xl text-gradient">{inr(o.total)}</span>
                  <p className="text-[10px] font-black uppercase text-lime">{ORDER_STATUSES[o.statusIndex]}</p>
                </div>
              </div>

              <Timeline index={o.statusIndex} />

              <ul className="mt-5 space-y-3">
                {o.items.map((i) => (
                  <li key={i.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3">
                    <Link to="/product/$productId" params={{ productId: i.productId }} className="group block w-14" aria-label={`View ${i.name}`}>
                      <img src={i.image} alt={i.name} loading="lazy" width={120} height={120}
                        className="aspect-square w-full rounded-xl border border-border object-cover transition group-hover:border-primary" />
                    </Link>
                    <div className="min-w-0">
                      <Link to="/product/$productId" params={{ productId: i.productId }}
                        className="block truncate text-sm font-extrabold transition hover:text-primary">{i.name}</Link>
                      <p className="text-xs text-muted-foreground">{i.printType} · {i.totalQty} pcs · {i.sizes.map((s) => `${s.size}×${s.qty}`).join(" ")}</p>
                    </div>
                    {o.statusIndex === 4 ? (
                      o.reviewedProducts.includes(i.productId) ? (
                        <span className="shrink-0 text-[10px] font-black uppercase text-lime">Reviewed</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setReview({ order: o, productId: i.productId, name: i.name }); setRating(5); setText(""); }}>
                          <Star className="h-3.5 w-3.5" /> Write a Review
                        </Button>
                      )
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Button size="sm" variant="outline" onClick={() => downloadInvoice(o)}>
                  <Download className="h-3.5 w-3.5" /> Download Invoice
                </Button>
                {o.statusIndex < 4 ? (
                  <Button size="sm" variant="ghost" onClick={() => advanceOrder(o.id)}>
                    <FastForward className="h-3.5 w-3.5" /> Advance status (demo)
                  </Button>
                ) : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  Subtotal {inr(o.subtotal)} · GST {inr(o.gst)}{o.discount ? ` · Saved ${inr(o.discount)}` : ""}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal open={!!review} onClose={() => setReview(null)} title="Write a review">
        {review ? (
          <div>
            <p className="text-sm font-extrabold">{review.name}</p>
            <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-checked={rating === n} role="radio"
                  className="text-3xl leading-none">
                  <span className={n <= rating ? "text-accent" : "text-muted"}>★</span>
                </button>
              ))}
            </div>
            <div className="mt-4"><Stars rating={rating} size={16} /></div>
            <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} aria-label="Your review"
              placeholder="How was the fit, print and delivery?"
              className="mt-4 w-full rounded-xl border border-input bg-background/60 p-3 text-sm" />
            <Button size="lg" className="mt-4 w-full" disabled={text.trim().length < 10}
              onClick={() => {
                addReview({ productId: review.productId, user: user?.name ?? "Customer", rating, text: text.trim() }, review.order.id);
                setReview(null);
              }}>
              Submit review
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Your review appears on the product page instantly.</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

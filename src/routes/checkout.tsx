import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Building2, CheckCircle2, CreditCard, Loader2, Smartphone } from "lucide-react";
import { Button, Card, Input } from "@/components/ui/kit";
import { RequireAuth } from "@/components/RequireAuth";
import { AddressForm } from "@/routes/profile.address";
import { GST_RATE, useApp } from "@/store/app";
import { inr } from "@/lib/storage";
import type { Address } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Jersey Fit" },
      { name: "description", content: "Confirm your address, choose a payment method and place your custom jersey order." },
      { property: "og:title", content: "Checkout — Jersey Fit" },
      { property: "og:description", content: "Secure demo checkout for custom jersey orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth title="Login to checkout">
      <Checkout />
    </RequireAuth>
  ),
});

const STEPS = ["Address", "Payment", "Confirm"] as const;
const METHODS = [
  { id: "UPI", label: "UPI", Icon: Smartphone, hint: "Pay via any UPI app" },
  { id: "Card", label: "Card", Icon: CreditCard, hint: "Credit / debit card" },
  { id: "Net Banking", label: "Net Banking", Icon: Building2, hint: "All major banks" },
  { id: "Cash on Delivery", label: "Cash on Delivery", Icon: Banknote, hint: "Pay when it arrives" },
];

function Checkout() {
  const { cart, totals, coupon, addresses, saveAddress, placeOrder } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [addrId, setAddrId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState<string>("UPI");
  const [pay, setPay] = useState({ upi: "", card: "", expiry: "", cvv: "", bank: "HDFC Bank" });
  const [payErrors, setPayErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def && !addrId) setAddrId(def.id);
    if (!addresses.length) setAdding(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  useEffect(() => {
    if (!cart.length && !success) navigate({ to: "/cart" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length, success]);

  const address: Address | undefined = addresses.find((a) => a.id === addrId);

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (method === "UPI" && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(pay.upi)) e["upi"] = "Enter a valid UPI ID (name@bank).";
    if (method === "Card") {
      if (pay.card.replace(/\s/g, "").length !== 16) e["card"] = "Card number must be 16 digits.";
      if (!/^\d{2}\/\d{2}$/.test(pay.expiry)) e["expiry"] = "Use MM/YY.";
      if (!/^\d{3}$/.test(pay.cvv)) e["cvv"] = "CVV must be 3 digits.";
    }
    setPayErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = () => {
    if (!address) return;
    setProcessing(true);
    // SWAP POINT: POST /api/orders with a real payment gateway callback.
    setTimeout(() => {
      const order = placeOrder(address, method);
      setProcessing(false);
      setSuccess(order.id);
      setTimeout(() => navigate({ to: "/profile/orders" }), 3000);
    }, 1800);
  };

  return (
    <div className="shell py-12">
      <h1 className="text-3xl sm:text-4xl">Check<span className="text-gradient">out</span></h1>

      {/* stepper */}
      <ol className="mt-6 flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${i <= step ? "bg-heat text-primary-foreground" : "border border-border text-muted-foreground"}`}>
              {i + 1}
            </span>
            <span className={`truncate text-xs font-extrabold uppercase tracking-wide sm:text-sm ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 ? <span className={`h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-border"}`} /> : null}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          {/* STEP 1 */}
          {step === 0 ? (
            <Card>
              <h2 className="text-lg">Delivery address</h2>
              <div className="mt-4 space-y-3">
                {addresses.map((a) => (
                  <label key={a.id} className={`block cursor-pointer rounded-xl border-2 p-4 ${addrId === a.id ? "border-primary bg-primary/10" : "border-border"}`}>
                    <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} className="mr-2 accent-[var(--color-primary)]" />
                    <span className="text-sm font-extrabold">{a.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{a.phone}</span>
                    {a.isDefault ? <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-black uppercase text-lime-foreground">Default</span> : null}
                    <p className="mt-1 text-sm text-muted-foreground">{a.house}, {a.city}, {a.state} — {a.pincode}</p>
                  </label>
                ))}
              </div>

              {adding ? (
                <div className="mt-5 border-t border-border pt-5">
                  <h3 className="mb-3 text-base">Add a new address</h3>
                  <AddressForm
                    onSave={(a) => { saveAddress(a); setAdding(false); }}
                    {...(addresses.length ? { onCancel: () => setAdding(false) } : {})}
                  />
                </div>
              ) : (
                <Button variant="outline" className="mt-4" onClick={() => setAdding(true)}>+ Add new address</Button>
              )}

              <Button size="lg" className="mt-6 w-full" disabled={!address} onClick={() => setStep(1)}>
                {address ? "Continue to payment" : "Select an address to continue"}
              </Button>
            </Card>
          ) : null}

          {/* STEP 2 */}
          {step === 1 ? (
            <Card>
              <h2 className="text-lg">Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {METHODS.map(({ id, label, Icon, hint }) => (
                  <label key={id} className={`cursor-pointer rounded-xl border-2 p-4 ${method === id ? "border-primary bg-primary/10" : "border-border"}`}>
                    <input type="radio" name="pay" checked={method === id} onChange={() => { setMethod(id); setPayErrors({}); }} className="sr-only" />
                    <span className="flex items-center gap-2 text-sm font-extrabold"><Icon className="h-4 w-4 text-lime" /> {label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
                  </label>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {method === "UPI" ? (
                  <Input label="UPI ID" placeholder="player@okhdfcbank" value={pay.upi} error={payErrors["upi"]}
                    onChange={(e) => setPay({ ...pay, upi: e.target.value })} />
                ) : null}
                {method === "Card" ? (
                  <>
                    <Input label="Card number" placeholder="4111 1111 1111 1111" inputMode="numeric" value={pay.card} error={payErrors["card"]}
                      onChange={(e) => setPay({ ...pay, card: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Expiry (MM/YY)" placeholder="08/29" value={pay.expiry} error={payErrors["expiry"]}
                        onChange={(e) => setPay({ ...pay, expiry: e.target.value })} />
                      <Input label="CVV" type="password" maxLength={3} value={pay.cvv} error={payErrors["cvv"]}
                        onChange={(e) => setPay({ ...pay, cvv: e.target.value })} />
                    </div>
                  </>
                ) : null}
                {method === "Net Banking" ? (
                  <div>
                    <label htmlFor="bank" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Select bank</label>
                    <select id="bank" value={pay.bank} onChange={(e) => setPay({ ...pay, bank: e.target.value })}
                      className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm">
                      {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra"].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                ) : null}
                {method === "Cash on Delivery" ? (
                  <p className="rounded-xl border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
                    Pay {inr(totals.total)} in cash when your kit is delivered. A ₹0 handling fee applies on demo orders.
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-1" size="lg" onClick={() => validatePayment() && setStep(2)}>Review order</Button>
              </div>
            </Card>
          ) : null}

          {/* STEP 3 */}
          {step === 2 ? (
            <Card>
              <h2 className="text-lg">Confirm your order</h2>
              <div className="mt-4 rounded-xl border border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shipping to</p>
                <p className="mt-1 text-sm font-extrabold">{address?.name} · {address?.phone}</p>
                <p className="text-sm text-muted-foreground">{address?.house}, {address?.city}, {address?.state} — {address?.pincode}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Paying with</p>
                <p className="text-sm font-extrabold">{method}</p>
              </div>
              <ul className="mt-4 space-y-2">
                {cart.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{i.name} <span className="text-muted-foreground">×{i.totalQty}</span></span>
                    <span className="shrink-0 font-bold">{inr(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} disabled={processing}>Back</Button>
                <Button className="flex-1" size="lg" variant="lime" onClick={confirm} disabled={processing}>
                  {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing payment…</> : `Pay ${inr(totals.total)}`}
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        {/* summary */}
        <Card className="lg:sticky lg:top-24">
          <h2 className="text-lg">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-bold">{inr(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Discount {coupon ? `(${coupon.code})` : ""}</dt><dd className="font-bold text-lime">{totals.discount ? `− ${inr(totals.discount)}` : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">GST ({GST_RATE * 100}%)</dt><dd className="font-bold">{inr(totals.gst)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="text-sm font-extrabold uppercase">Total</dt>
              <dd className="display text-2xl text-gradient">{inr(totals.total)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* success */}
      <AnimatePresence>
        {success ? (
          <motion.div className="fixed inset-0 z-100 grid place-items-center overflow-hidden bg-background/90 p-4 backdrop-blur"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="confetti-bit"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  background: ["var(--color-primary)", "var(--color-accent)", "var(--color-lime)"][i % 3],
                }} />
            ))}
            <motion.div className="panel relative max-w-md p-8 text-center"
              initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime">
                <CheckCircle2 className="h-10 w-10 text-lime-foreground" />
              </motion.span>
              <h2 className="mt-5 text-3xl">Order placed!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Order <span className="font-extrabold text-lime">{success}</span> is confirmed. Taking you to My Orders…
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

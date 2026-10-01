import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button, Card, Input, Textarea } from "@/components/ui/kit";
import hero from "@/assets/hero-1.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Jersey Fit — Bulk Jersey Enquiries" },
      { name: "description", content: "Talk to the Jersey Fit team about custom squad kits, bulk pricing and design support." },
      { property: "og:title", content: "Contact Jersey Fit" },
      { property: "og:description", content: "Custom jersey enquiries, bulk orders and design help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

interface Errs { name?: string; email?: string; message?: string }

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errs>({});
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Errs = {};
    if (form.name.trim().length < 3) err.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(form.email)) err.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) err.message = "Tell us a bit more (10+ characters).";
    setErrors(err);
    if (Object.keys(err).length) return;
    setSending(true);
    // SWAP POINT: POST /api/contact
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message sent! We reply within one working day.");
    }, 700);
  };

  return (
    <div>
      <section className="relative min-h-[330px] overflow-hidden border-b border-border">
        <img src={hero} alt="Contact Jersey Fit for custom team jerseys" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[330px] items-end py-14"><div className="max-w-2xl"><span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Contact</span><h1 className="mt-3 text-4xl sm:text-6xl">Let's build your <span className="text-gradient">kit</span></h1><p className="mt-4 text-sm text-foreground/80 sm:text-lg">Bulk quote, artwork check or a sizing question — we're on it.</p></div></div>
      </section>
      <div className="shell grid gap-6 py-14 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input label="Your name" value={form.name} error={errors.name} placeholder="Rahul Verma"
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} error={errors.email} placeholder="you@email.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Textarea label="Message" rows={6} value={form.message} error={errors.message}
              placeholder="We need 28 all-over-print jerseys with names and numbers by 20th…"
              onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            {[
              { Icon: Phone, label: "Call / WhatsApp", value: "+91 98765 43210" },
              { Icon: Mail, label: "Email", value: "hello@jerseyfit.in" },
              { Icon: MapPin, label: "Factory", value: "Plot 42, Textile Park, Tirupur, TN 641604" },
              { Icon: Clock, label: "Working Hours", value: "Monday – Saturday: 10:00 AM – 7:00 PM (Sunday Closed)" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-heat">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              </div>
            ))}
          </Card>
          <a href="https://wa.me/919876543210?text=Hi%20Jersey%20Fit%20Team%2C%20I%20would%20like%20to%20request%20a%20quote%20for%20team%20jerseys." target="_blank" rel="noreferrer" className="panel flex items-center gap-4 p-5 transition-transform hover:-translate-y-1" aria-label="Request a team jersey quote through WhatsApp">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-lime"><MessageCircle className="h-6 w-6 text-lime-foreground" /></span>
            <span><strong className="block text-sm uppercase">Request a quote through WhatsApp</strong><span className="mt-1 block text-xs text-muted-foreground">Start a chat with the Jersey Fit team.</span></span>
          </a>
          <div className="panel grid h-56 place-items-center bg-surface-2 text-center text-sm text-muted-foreground">
            <div>
              <MapPin className="mx-auto mb-2 h-6 w-6 text-lime" />
              Map placeholder — Tirupur, Tamil Nadu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

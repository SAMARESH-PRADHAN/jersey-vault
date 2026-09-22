import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Button, Card, Input, SectionTitle, Textarea } from "@/components/ui/kit";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Jersey Fit — Bulk Jersey Enquiries" },
      { name: "description", content: "Talk to the Jersey Fit team about custom squad kits, bulk pricing and design support." },
      { property: "og:title", content: "Contact Jersey Fit" },
      { property: "og:description", content: "Custom jersey enquiries, bulk orders and design help." },
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
    <div className="shell py-14">
      <SectionTitle kicker="Contact" title="Let's build your kit" sub="Bulk quote, artwork check or a sizing question — we're on it." />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
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
              { Icon: Clock, label: "Hours", value: "Mon–Sat, 9:30 AM – 7:00 PM IST" },
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

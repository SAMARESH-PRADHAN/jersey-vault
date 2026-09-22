import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button, Input, Modal } from "@/components/ui/kit";
import { useApp } from "@/store/app";

type Tab = "login" | "signup";
interface Errs { name?: string; phone?: string; email?: string; password?: string; form?: string }

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v);

export function AuthModal() {
  const { authOpen, closeAuth, login, signup, loginWithGoogle, authRedirect } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Errs>({});
  const [busy, setBusy] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const done = () => {
    closeAuth();
    setForm({ name: "", email: "", phone: "", password: "" });
    setErrors({});
    if (authRedirect) navigate({ to: authRedirect });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Errs = {};
    if (tab === "signup") {
      if (form.name.trim().length < 3) err.name = "Enter your full name.";
      if (!phoneOk(form.phone)) err.phone = "Enter a valid 10-digit mobile number.";
    }
    if (!emailOk(form.email)) err.email = "Enter a valid email address.";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    // Simulated network latency — replace with a real auth API call.
    setTimeout(() => {
      const msg =
        tab === "signup"
          ? signup({ name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password })
          : login(form.email.trim(), form.password);
      setBusy(false);
      if (msg) setErrors({ form: msg });
      else done();
    }, 600);
  };

  return (
    <Modal open={authOpen} onClose={closeAuth} title={tab === "login" ? "Welcome back" : "Join Jersey Fit"}>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-background/70 p-1">
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setErrors({}); }}
            className="relative h-10 rounded-full text-sm font-extrabold uppercase tracking-wide"
          >
            {tab === t ? (
              <motion.span layoutId="authTab" className="absolute inset-0 rounded-full bg-heat" />
            ) : null}
            <span className={tab === t ? "relative text-primary-foreground" : "relative text-muted-foreground"}>
              {t === "login" ? "Login" : "Signup"}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        {tab === "signup" ? (
          <>
            <Input label="Full name" value={form.name} onChange={set("name")} error={errors.name} placeholder="Rahul Verma" autoComplete="name" />
            <Input label="Phone" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="9876543210" inputMode="numeric" autoComplete="tel" />
          </>
        ) : null}
        <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@email.com" autoComplete="email" />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} error={errors.password} placeholder="••••••••" autoComplete="current-password" />

        {errors.form ? <p className="text-sm font-semibold text-destructive">{errors.form}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : tab === "login" ? "Login" : "Create account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={() => { loginWithGoogle(); done(); }}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.9 29.3 36 24 36a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 44 24c0-1.4-.1-2.7-.4-4z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.6 5.1A20 20 0 0 0 24 44z" />
          <path fill="#1976D2" d="M43.6 20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.9 35.4 44 30.2 44 24c0-1.4-.1-2.7-.4-4z" />
        </svg>
        Continue with Google
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo mode — accounts are stored in your browser only.
      </p>
    </Modal>
  );
}

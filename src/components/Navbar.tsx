import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, MapPin, Menu, Package, ShoppingCart, Sparkles, User as UserIcon, X } from "lucide-react";
import { Button } from "@/components/ui/kit";
import { CATEGORIES, TOP_WEAR_SUBCATEGORIES, WINTER_SUBCATEGORIES } from "@/data/products";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, openAuth, logout, cartCount } = useApp();
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [accordion, setAccordion] = useState(false);
  const [topWearOpen, setTopWearOpen] = useState(false);
  const [topWearAccordion, setTopWearAccordion] = useState(false);
  const [winterOpen, setWinterOpen] = useState(false);
  const [winterAccordion, setWinterAccordion] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDrawer(false);
    setCatOpen(false);
    setProfileOpen(false);
    setTopWearOpen(false);
    setWinterOpen(false);
  }, [path]);

  useEffect(() => {
    if (!drawer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setDrawer(false); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", close); };
  }, [drawer]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setCatOpen(false);
        setProfileOpen(false);
        setTopWearOpen(false);
        setWinterOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const navLink = "whitespace-nowrap text-sm font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div ref={wrap} className="shell flex h-16 items-center justify-between gap-4 md:h-18">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Jersey Fit home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-sm font-black text-primary-foreground">JF</span>
          <span className="display text-xl sm:text-2xl">
            Jersey<span className="text-gradient">Fit</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          <Link to="/" className={navLink}>Home</Link>
          <div className="relative">
            <button className={cn(navLink, "flex items-center gap-1")} onClick={() => setCatOpen((v) => !v)} aria-expanded={catOpen}>
              Custom Team Jersey <ChevronDown className="h-4 w-4" />
            </button>
            <AnimatePresence>
              {catOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="panel absolute left-0 top-9 grid w-[34rem] grid-cols-2 gap-1 overflow-hidden p-3"
                >
                  {CATEGORIES.map((c) => (
                    <Link key={c.slug} to="/shop" search={{ category: c.slug }}
                      className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">
                      {c.label}
                    </Link>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <Link to="/premium-collection" className={cn(navLink, "flex items-center gap-1.5")}>
            <Sparkles className="h-3.5 w-3.5 text-lime" />Custom Premium Collection
          </Link>
          <div className="relative">
            <Button variant="ghost" className={cn(navLink, "h-auto rounded-none p-0 hover:bg-transparent")} onClick={() => setTopWearOpen((v) => !v)} aria-expanded={topWearOpen}>
              Top Wear <ChevronDown className="h-4 w-4" />
            </Button>
            {topWearOpen ? <div className="panel absolute left-0 top-9 w-64 p-2">
              {TOP_WEAR_SUBCATEGORIES.map((sub) => <Link key={sub.slug} to="/shop" search={{ category: "top-wear", subCategory: sub.slug }} onClick={() => setTopWearOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">{sub.label}</Link>)}
            </div> : null}
          </div>
          <div className="relative">
            <Button variant="ghost" className={cn(navLink, "h-auto rounded-none p-0 hover:bg-transparent")} onClick={() => setWinterOpen((v) => !v)} aria-expanded={winterOpen}>
              Winter Top Wear <ChevronDown className="h-4 w-4" />
            </Button>
            {winterOpen ? <div className="panel absolute left-0 top-9 w-64 p-2">
              <Link to="/winter-top-wear" onClick={() => setWinterOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">All Winter Top Wear</Link>
              {WINTER_SUBCATEGORIES.filter((item) => item.slug !== "all").map((sub) => (
                <Link key={sub.slug} to="/winter-top-wear" search={{ sub: sub.slug }} onClick={() => setWinterOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">{sub.label}</Link>
              ))}
            </div> : null}
          </div>
          <Link to="/customers" className={navLink}>Our Customers</Link>
          <Link to="/contact" className={navLink}>Contact</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="relative hidden sm:block">
              <button onClick={() => setProfileOpen((v) => !v)} aria-expanded={profileOpen}
                className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface/60 px-3 text-sm font-bold">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>
              <AnimatePresence>
                {profileOpen ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="panel absolute right-0 top-13 w-52 overflow-hidden p-2">
                    <Link to="/profile/address" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">
                      <MapPin className="h-4 w-4 text-lime" /> My Address
                    </Link>
                    <Link to="/profile/orders" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">
                      <Package className="h-4 w-4 text-accent" /> My Orders
                    </Link>
                    <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-surface-2">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <Button className="hidden sm:inline-flex" onClick={() => openAuth()}>
              <UserIcon className="h-4 w-4" /> Login / Signup
            </Button>
          )}

          <Link to="/cart" aria-label={`Cart, ${cartCount} items`}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/60">
            <motion.span key={cartCount} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.35 }}>
              <ShoppingCart className="h-5 w-5" />
            </motion.span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime px-1 text-[10px] font-black text-lime-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <button onClick={() => setDrawer(true)} aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/60 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      {drawer ? createPortal(<AnimatePresence>
        {drawer ? (
          <motion.div className="fixed inset-0 z-[120] bg-background/80 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.aside
              className="ml-auto h-full w-[84%] max-w-sm border-l border-border bg-surface p-6 overflow-y-auto overscroll-contain"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="display text-xl">Menu</span>
                <button onClick={() => setDrawer(false)} aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="space-y-1">
                <Link onClick={() => setDrawer(false)} to="/" className="block rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">Home</Link>
                <button onClick={() => setAccordion((v) => !v)} aria-expanded={accordion}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">
                  Custom Team Jersey
                  <ChevronDown className={cn("h-4 w-4 transition-transform", accordion && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {accordion ? (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {CATEGORIES.map((c) => (
                        <Link onClick={() => setDrawer(false)} key={c.slug} to="/shop" search={{ category: c.slug }}
                          className="block rounded-xl px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                          {c.label}
                        </Link>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <Link onClick={() => setDrawer(false)} to="/premium-collection" className="flex items-center gap-1.5 rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">
                  <Sparkles className="h-4 w-4 text-lime" />Custom Premium Collection
                </Link>
                <Button variant="ghost" onClick={() => setTopWearAccordion((v) => !v)} aria-expanded={topWearAccordion} className="h-auto min-h-12 w-full justify-between rounded-xl px-3 py-3 text-left font-bold uppercase text-foreground">
                  <span className="min-w-0">Top Wear</span><ChevronDown className={cn("h-4 w-4 shrink-0", topWearAccordion && "rotate-180")} />
                </Button>
                {topWearAccordion ? <div>{TOP_WEAR_SUBCATEGORIES.map((sub) => <Link key={sub.slug} onClick={() => setDrawer(false)} to="/shop" search={{ category: "top-wear", subCategory: sub.slug }} className="block rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">{sub.label}</Link>)}</div> : null}
                <button onClick={() => setWinterAccordion((v) => !v)} aria-expanded={winterAccordion}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">
                  Winter Top Wear
                  <ChevronDown className={cn("h-4 w-4 transition-transform", winterAccordion && "rotate-180")} />
                </button>
                {winterAccordion ? <div>
                  <Link onClick={() => setDrawer(false)} to="/winter-top-wear" className="block rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">All Winter Top Wear</Link>
                  {WINTER_SUBCATEGORIES.filter((item) => item.slug !== "all").map((sub) => (
                    <Link key={sub.slug} onClick={() => setDrawer(false)} to="/winter-top-wear" search={{ sub: sub.slug }} className="block rounded-xl px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground">{sub.label}</Link>
                  ))}
                </div> : null}
                <Link onClick={() => setDrawer(false)} to="/customers" className="block rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">Our Customers</Link>
                <Link onClick={() => setDrawer(false)} to="/contact" className="block rounded-xl px-3 py-3 font-bold uppercase hover:bg-surface-2">Contact</Link>
              </nav>

              <div className="mt-6 space-y-2 border-t border-border pt-6">
                {user ? (
                  <>
                    <Link onClick={() => setDrawer(false)} to="/profile/address" className="block rounded-xl px-3 py-3 font-semibold hover:bg-surface-2">My Address</Link>
                    <Link onClick={() => setDrawer(false)} to="/profile/orders" className="block rounded-xl px-3 py-3 font-semibold hover:bg-surface-2">My Orders</Link>
                    <Button variant="outline" className="w-full" onClick={() => { logout(); setDrawer(false); }}>Logout</Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => { setDrawer(false); openAuth(); }}>Login / Signup</Button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>, document.body) : null}
    </header>
  );
}

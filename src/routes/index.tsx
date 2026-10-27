import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button, Card, SectionTitle } from "@/components/ui/kit";
import { HeroSlider } from "@/components/HeroSlider";
import { ReviewMarquee } from "@/components/ReviewMarquee";
import { ProductCard } from "@/components/ProductCard";
import { CLUBS, FACTORY_STATS, SERVICES } from "@/data/content";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import j1 from "@/assets/jersey-1.jpg";
import j2 from "@/assets/jersey-2.jpg";
import j3 from "@/assets/jersey-3.jpg";
import hero from "@/assets/hero-1.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jersey Fit — Custom Sports Jerseys Printed In-House" },
      { name: "description", content: "Design and order custom sports jerseys: all over print, front print and back print. Bulk squad kits, 72-hour dispatch across India." },
      { property: "og:title", content: "Jersey Fit — Custom Sports Jerseys" },
      { property: "og:description", content: "Sublimation and DTF printed jerseys for clubs, schools and squads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 1400);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="display text-3xl text-gradient sm:text-4xl">
      {n.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

function Home() {
  const featured = PRODUCTS.slice(0, 4);
  const topWearProducts = PRODUCTS.filter((p) => p.category === "top-wear").slice(-4);

  return (
    <>
      <HeroSlider />

      {/* CUSTOM TEAM JERSEY — premium showcase */}
      <section className="shell py-16 sm:py-20">
        <SectionTitle kicker="Custom Team Jersey" title="Made for every kind of team" sub="Choose your sport, event or print style and start building a kit that belongs to your group." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {CATEGORIES.map((category, index) => (
            <motion.div key={category.slug} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 4) * 0.06, duration: 0.45 }}>
              <Link to="/shop" search={{ category: category.slug }}
                className="group relative block aspect-4/5 overflow-hidden rounded-2xl border border-border transition-all duration-300 hover:border-lime/60 hover:glow">
                <img src={category.image} alt={category.label} loading="lazy" width={1024} height={1024}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-foreground backdrop-blur-md sm:text-[10px]">
                  {index % 2 === 0 ? "Custom Kit" : "Team Squad"}
                </span>
                <span className="display absolute right-3 top-2 text-xl text-foreground/25 sm:text-3xl">0{index + 1}</span>
                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-5">
                  <h3 className="text-base leading-tight sm:text-xl">{category.label}</h3>
                  <p className="mt-1 hidden line-clamp-2 text-xs text-foreground/75 sm:block">{category.description}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-lime transition-transform duration-300 group-hover:translate-x-1 sm:mt-3 sm:text-xs">
                    Explore Squad Kits <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRENDING */}
      <section className="shell py-16">
        <SectionTitle kicker="Trending" title="Fresh off the press" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/shop" search={{ category: "all" }}><Button size="lg" variant="lime">View all jerseys</Button></Link>
        </div>
      </section>

      {/* JERSEY FIT TOP WEAR */}
      <section className="border-y border-border bg-surface/40 py-16">
        <div className="shell">
          <SectionTitle kicker="Exclusive Ready-to-Wear" title="Jersey Fit Top Wear" sub="Everyday athletic performance tops and classic polos. Maximum 3 pieces per order." />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topWearProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/shop" search={{ category: "top-wear" }}><Button size="lg" variant="lime">View All Jersey Fit Top Wear →</Button></Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-surface/40 py-16">
        <div className="shell">
          <SectionTitle kicker="How It Works" title="From idea to match day" sub="A simple four-step path from your first pick to the finished squad kit." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Icons.Shirt, title: "Pick Jersey & Style", text: "Choose sublimation, DTF or plain." },
              { icon: Icons.Users, title: "Add Squad Details", text: "Upload your logo, names and numbers per size." },
              { icon: Icons.BadgeCheck, title: "Proof & Verification", text: "Review every detail before production." },
              { icon: Icons.Truck, title: "Express Dispatch", text: "Track your finished kits to your doorstep." },
            ].map(({ icon: Icon, title, text }, index) => (
              <motion.div key={title} className="relative border-l-2 border-primary px-3 py-3 md:px-5 md:py-4 first:border-lime md:border-l md:border-t-2" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-heat"><Icon className="h-5 w-5 text-primary-foreground" /></span>
                  <span className="display text-2xl text-lime md:text-4xl md:text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-3 text-base md:mt-5 md:text-lg">{title}</h3>
                <p className="mt-2 text-xs text-muted-foreground md:text-sm">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="shell scroll-mt-24 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">About Us</span>
            <h2 className="mt-3 text-3xl sm:text-5xl">
              We print kits that <span className="text-gradient">feel like a brand</span>
            </h2>
            <p className="mt-5 text-sm text-muted-foreground sm:text-base">
              Jersey Fit started in 2016 on a single sublimation press in Tirupur. Today our team of 64 prints,
              stitches and ships squad kits for more than 1,400 clubs, academies and corporate leagues across India.
            </p>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              We only make top wear — jerseys. That focus is why our print registration, fabric weight and sizing
              stay consistent whether you order 10 pieces or 10,000.
            </p>
            <div className="mt-7 flex gap-3">
              <Link to="/shop" search={{ category: "all" }}><Button>Browse jerseys</Button></Link>
              <Link to="/contact"><Button variant="outline">Talk to us</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[j1, j2, j3, hero].map((src, i) => (
              <motion.img key={i} src={src} alt="Jersey Fit production and products" loading="lazy" width={1024} height={1024}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`h-full w-full rounded-2xl border border-border object-cover ${i % 3 === 0 ? "aspect-square" : "aspect-4/5"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="shell scroll-mt-24 py-16">
        <SectionTitle kicker="Services" title="Everything your kit needs" sub="From artwork to doorstep — handled in one place." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = (Icons[s.icon as keyof typeof Icons] ?? Icons.Star) as Icons.LucideIcon;
            return (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full transition-transform hover:-translate-y-1">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-heat">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </span>
                  <h3 className="mt-4 text-lg">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* FACTORY */}
      <section id="factory" className="scroll-mt-24 border-y border-border bg-surface/40 py-20">
        <div className="shell">
          <SectionTitle kicker="Our Factory" title="18,000 sq ft of printing muscle" sub="Two sublimation lines, four DTF stations and an in-house stitching floor." />
          <div className="grid gap-4 sm:grid-cols-4">
            {FACTORY_STATS.map((s) => (
              <Card key={s.label} className="text-center">
                <Counter value={s.value} suffix={s.suffix} />
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </Card>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[hero, j2, j1].map((src, i) => (
              <img key={i} src={src} alt="Inside the Jersey Fit factory" loading="lazy" width={1024} height={768}
                className="aspect-video w-full rounded-2xl border border-border object-cover" />
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMERS */}
      <section className="shell py-16">
        <SectionTitle kicker="Our Customers" title="Clubs that wear Jersey Fit" />
        <div className="flex flex-wrap justify-center gap-3">
          {CLUBS.map((c) => (
            <span key={c} className="rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16">
        <div className="shell">
          <SectionTitle kicker="Customer Reviews" title="4.8 average from 2,300+ squads" sub="Hover to pause the reel." />
        </div>
        <ReviewMarquee />
      </section>
    </>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/kit";
import hero from "@/assets/hero-1.jpg";
import j1 from "@/assets/jersey-1.jpg";
import j2 from "@/assets/jersey-2.jpg";

const SLIDES = [
  {
    image: hero,
    kicker: "Season 2026 Drop",
    title: "Own the field in a kit built for your squad",
    text: "Sublimation and DTF printing, 72-hour dispatch, no minimum order drama.",
  },
  {
    image: j2,
    kicker: "All Over Print",
    title: "Neon graphics that survive 50 washes",
    text: "Colour-locked inks on breathable honeycomb polyester.",
  },
  {
    image: j1,
    kicker: "Bulk Squad Kits",
    title: "10 jerseys or 10,000 — same crisp finish",
    text: "Slab pricing that drops as your order grows. Free design support included.",
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [go]);

  const slide = SLIDES[index]!;

  return (
    <section
      className="relative h-[78vh] min-h-125 w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured jerseys"
      onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0]!.clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={slide.image}
          alt={slide.title}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

      <div className="shell relative flex h-full flex-col justify-end pb-20 sm:justify-center sm:pb-0">
        <motion.div key={`c${index}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
          <span className="inline-block rounded-full bg-lime px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-lime-foreground">
            {slide.kicker}
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl lg:text-7xl">
            <span className="text-gradient">{slide.title}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-lg">{slide.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/shop" search={{ category: "all" }}><Button size="lg">Shop Now</Button></Link>
            <Link to="/contact"><Button size="lg" variant="outline">Get a bulk quote</Button></Link>
          </div>
        </motion.div>
      </div>

      <button onClick={() => go(-1)} aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/60 backdrop-blur sm:grid">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => go(1)} aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/60 backdrop-blur sm:grid">
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`}
            className={i === index ? "h-2.5 w-8 rounded-full bg-brand" : "h-2.5 w-2.5 rounded-full bg-muted"} />
        ))}
      </div>
    </section>
  );
}

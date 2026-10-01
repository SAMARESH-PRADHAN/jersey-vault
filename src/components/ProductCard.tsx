import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Stars } from "@/components/ui/kit";
import { inr } from "@/lib/storage";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.4 }}>
      <Link to="/product/$productId" params={{ productId: product.id }}
        className="panel group block overflow-hidden p-0 transition-transform duration-300 hover:-translate-y-1.5 hover:glow">
        <div className="relative aspect-square overflow-hidden bg-background">
          <img src={product.images[0]} alt={product.name} loading="lazy" width={1024} height={1024}
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0" />
          <img src={product.images[1] ?? product.images[0]} alt="" aria-hidden="true" loading="lazy" width={1024} height={1024}
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {product.tag ? (
            <span className="absolute left-3 top-3 rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lime-foreground">
              {product.tag}
            </span>
          ) : null}
          {product.isExclusiveTopWear ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-wider text-accent-foreground">
              Exclusive Ready-to-Wear
            </span>
          ) : null}
          <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-black text-lime">
            {off}% OFF
          </span>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.code}</p>
          <h3 className="mt-1 line-clamp-2 text-sm normal-case tracking-normal" style={{ fontFamily: "var(--font-sans)", fontWeight: 800 }}>
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="display text-xl text-gradient">{inr(product.price)}</span>
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

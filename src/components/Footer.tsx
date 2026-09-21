import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { CATEGORIES } from "@/data/products";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/40">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="display text-2xl">Jersey<span className="text-gradient">Fit</span></span>
          <p className="mt-3 text-sm text-muted-foreground">
            Custom sports jerseys printed in-house. Squad kits, club kits and one-off pieces — made in India, shipped everywhere.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label={`Jersey Fit on social ${i + 1}`}
                className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-surface-2">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Shop links">
          <h3 className="text-sm tracking-widest">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/shop" search={{ category: c.slug }} className="hover:text-foreground">{c.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company links">
          <h3 className="text-sm tracking-widest">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" hash="about" className="hover:text-foreground">About Us</Link></li>
            <li><Link to="/" hash="services" className="hover:text-foreground">Services</Link></li>
            <li><Link to="/" hash="factory" className="hover:text-foreground">Our Factory</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm tracking-widest">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-lime" /> +91 98765 43210</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-accent" /> hello@jerseyfit.in</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" /> Plot 42, Textile Park, Tirupur, TN 641604</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Jersey Fit. Demo store — all data lives in your browser.
      </div>
    </footer>
  );
}

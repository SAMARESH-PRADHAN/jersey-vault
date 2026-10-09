import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Quote } from "lucide-react";
import { SectionTitle } from "@/components/ui/kit";
import hero from "@/assets/hero-1.jpg";
import j1 from "@/assets/jersey-1.jpg";
import j2 from "@/assets/jersey-2.jpg";
import j3 from "@/assets/jersey-3.jpg";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Our Customers — Teams Wearing Jersey Fit" },
      { name: "description", content: "Meet the clubs, academies, runners and community groups wearing custom Jersey Fit kits." },
      { property: "og:title", content: "Our Customers — Jersey Fit" },
      { property: "og:description", content: "A gallery of teams and communities wearing Jersey Fit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});

const customers = [
  { name: "Royal Cricket Academy", city: "Kolkata", type: "Cricket Jersey", image: hero, productId: "p15", quote: "The full squad sizing arrived right, and the colours stayed exact." },
  { name: "City Striders Marathon Club", city: "Bengaluru", type: "Marathon Jersey", image: j3, productId: "p22", quote: "Light enough for race day and unmistakable in every event photo." },
  { name: "Thunderbolts FC", city: "Mumbai", type: "Football Jersey", image: j2, productId: "p16", quote: "The kit finally looks as professional as the football we want to play." },
  { name: "Ganesh Yuvak Mandal", city: "Pune", type: "Ganesh Puja Jersey", image: j1, productId: "p20", quote: "Our volunteers looked united from setup morning through visarjan." },
  { name: "Metro Spikers", city: "Chennai", type: "Volleyball Jersey", image: j1, productId: "p17", quote: "Flexible, breathable and sharp under the indoor court lights." },
  { name: "Rapid Raiders", city: "Hyderabad", type: "Kabaddi Jersey", image: hero, productId: "p19", quote: "Strong seams, easy movement and a print that holds up to contact." },
  { name: "Sunrise Walkers", city: "Bhubaneswar", type: "Morning Walk Group", image: j2, productId: "p21", quote: "Comfortable for every age in our group and easy to reorder." },
  { name: "Coastal Hoopers", city: "Kochi", type: "Basketball Jersey", image: j3, productId: "p18", quote: "The bold numbers and relaxed fit gave us a real club identity." },
];

function CustomersPage() {
  return (
    <div>
      <section className="relative min-h-[360px] overflow-hidden border-b border-border">
        <img src={j2} alt="Custom Jersey Fit teamwear" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[360px] items-end py-14">
          <div className="max-w-3xl"><span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Our Customers</span><h1 className="mt-3 text-4xl sm:text-7xl">Every jersey tells a <span className="text-gradient">team story</span></h1><p className="mt-4 max-w-2xl text-sm text-foreground/80 sm:text-lg">Clubs, academies and community squads that turned their identity into a kit.</p></div>
        </div>
      </section>
      <section className="shell py-20">
        <SectionTitle kicker="Team Gallery" title="Worn with pride" sub="Real team types represented with our existing demo imagery." />
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer, index) => (
            <article key={customer.name} className={`panel group flex flex-col overflow-hidden p-0 ${index === 0 || index === 5 ? "lg:col-span-2" : ""}`}>
              <Link to="/product/$productId" params={{ productId: customer.productId }} className="relative block aspect-4/3 overflow-hidden" aria-label={`View ${customer.name} jersey details`}>
                <img src={customer.image} alt={`${customer.name} jersey`} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-lime px-3 py-1 text-[10px] font-black uppercase tracking-wider text-lime-foreground">{customer.type}</span>
              </Link>
              <div className="flex flex-1 flex-col p-5"><h2 className="text-xl">{customer.name}</h2><p className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-accent" />{customer.city}</p><blockquote className="mt-4 flex gap-3 text-sm text-muted-foreground"><Quote className="h-5 w-5 shrink-0 text-lime" />“{customer.quote}”</blockquote>
                <Link
                  to="/product/$productId"
                  params={{ productId: customer.productId }}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-heat px-5 py-3.5 text-xs font-black uppercase tracking-wider text-primary-foreground transition hover:glow sm:w-auto sm:py-3"
                  aria-label={`View ${customer.name} jersey details`}
                >
                  View Jersey Details <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Factory, Ruler, ShieldCheck, Sparkles, Timer, type LucideIcon } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui/kit";
import hero from "@/assets/hero-1.jpg";
import jersey from "@/assets/jersey-1.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Jersey Fit — Crafted for Champions" },
      { name: "description", content: "Meet the Tirupur team designing, printing and stitching custom sports jerseys for clubs and communities across India." },
      { property: "og:title", content: "About Jersey Fit — Crafted for Champions" },
      { property: "og:description", content: "In-house jersey manufacturing, dependable colour and precise team sizing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const trust: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Factory, title: "100% In-House Production", text: "Design, print, cut, stitch and inspection stay under one roof." },
  { Icon: ShieldCheck, title: "Zero-Fade Guarantee", text: "Colour-locked inks and tested fabrics protect every team identity." },
  { Icon: Timer, title: "Rapid 72hr Turnaround", text: "Focused production lanes keep approved kits moving quickly." },
  { Icon: Ruler, title: "Precision Sizing", text: "Consistent patterns across XS–3XL make squad ordering simpler." },
];

function AboutPage() {
  return (
    <div>
      <section className="relative min-h-[420px] overflow-hidden border-b border-border">
        <img src={hero} alt="Jersey Fit custom jersey production" width={1600} height={900} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="shell relative flex min-h-[420px] items-end py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">About Jersey Fit</span>
            <h1 className="mt-3 text-5xl sm:text-7xl">Crafted for <span className="text-gradient">Champions</span></h1>
            <p className="mt-5 max-w-2xl text-sm text-foreground/80 sm:text-lg">We turn team identity into dependable performance wear, made by one accountable team in Tirupur.</p>
          </div>
        </div>
      </section>

      <section className="shell grid items-center gap-10 py-20 lg:grid-cols-2">
        <img src={jersey} alt="A Jersey Fit sports jersey" loading="lazy" width={1024} height={1024} className="aspect-4/3 w-full rounded-2xl border border-border object-cover" />
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">Who We Are</span>
          <h2 className="mt-3 text-3xl sm:text-5xl">One team behind every team</h2>
          <p className="mt-5 text-sm text-muted-foreground sm:text-base">Jersey Fit began with one sublimation press in Tirupur in 2016. Today, our designers, print specialists, cutters and stitchers work together to make kits for sports clubs, schools, academies, companies and community groups.</p>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">Keeping production in-house gives us control over colour, fabric weight, print registration and fit—from the first digital proof to the final quality check.</p>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40 py-20">
        <div className="shell">
          <SectionTitle kicker="Why Teams Trust Us" title="Built on consistency" sub="The details that matter when every player needs to look and feel like one unit." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(({ Icon, title, text }) => (
              <Card key={title} className="h-full">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-heat"><Icon className="h-6 w-6 text-primary-foreground" /></span>
                <h3 className="mt-5 text-lg">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-20">
        <SectionTitle kicker="Our Process" title="Made under one roof" />
        <ol className="grid gap-4 md:grid-cols-4">
          {["Digital design & proof", "Colour-locked printing", "Precision cut & sew", "Nine-point quality check"].map((step, index) => (
            <li key={step} className="border-t-2 border-primary pt-5">
              <span className="display text-4xl text-gradient">0{index + 1}</span>
              <div className="mt-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-lime" /><h3 className="text-base">{step}</h3></div>
              <p className="mt-2 text-sm text-muted-foreground">Every stage is checked and signed off before the kit moves forward.</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex items-center gap-2 text-sm font-bold text-lime"><BadgeCheck className="h-5 w-5" /> One accountable team from artwork to dispatch.</div>
      </section>
    </div>
  );
}
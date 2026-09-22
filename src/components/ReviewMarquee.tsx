import { Stars } from "@/components/ui/kit";
import { useApp } from "@/store/app";

export function ReviewMarquee() {
  const { reviews } = useApp();
  const list = reviews.slice(0, 10);
  const loop = [...list, ...list];

  if (!list.length) return null;

  return (
    <div className="marquee overflow-hidden" tabIndex={0} aria-label="Customer reviews, scrolling">
      <div className="marquee-track">
        {loop.map((r, i) => (
          <article key={`${r.id}-${i}`} className="panel w-72 shrink-0 p-5 sm:w-80">
            <Stars rating={r.rating} />
            <p className="mt-3 text-sm text-muted-foreground">“{r.text}”</p>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-lime">{r.user}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const MESSAGE =
  "🔥 WE MAKE CUSTOMISED TEAM JERSEYS & ATHLETIC MERCHANDISE • ⚡ 100% SUBLIMATION & DTF PRINTING (LOGO, NAME & NUMBER) • 🚚 FAST DISPATCH ACROSS INDIA • 🏆 TRUSTED BY 500+ SPORTS TEAMS • 💬 WHATSAPP US FOR INSTANT CUSTOM TEAM QUOTES • ";

/** Infinite right-to-left announcement ticker above the navbar. Pauses on hover/focus. */
export function AnnouncementBar() {
  return (
    <div className="ticker overflow-hidden border-b border-border bg-surface py-2" aria-label="Store announcements">
      <div className="ticker-track">
        <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-foreground/90 sm:text-xs">
          {MESSAGE}
        </span>
        <span aria-hidden="true" className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-foreground/90 sm:text-xs">
          {MESSAGE}
        </span>
      </div>
    </div>
  );
}

// import { toast } from "sonner";
// import { Link2, Share2 } from "lucide-react";
// import { Button } from "@/components/ui/kit";

// /**
//  * Share widget for the product details page:
//  * WhatsApp share, copy-link with toast, and native share on supporting devices.
//  */
// export function ShareWidget({ name, code }: { name: string; code: string }) {
//   const url = typeof window === "undefined" ? "" : window.location.href;
//   const text = `${name} (${code}) — Jersey Fit. Check out this jersey: ${url}`;
//   const whatsappHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
//   const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

//   const copyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(url);
//       toast.success("Product link copied");
//     } catch {
//       toast.error("Could not copy the link — long-press the address bar instead.");
//     }
//   };

//   const nativeShare = () => {
//     navigator.share?.({ title: name, text, url }).catch(() => {
//       /* user dismissed the sheet */
//     });
//   };

//   return (
//     <div className="panel mt-5 p-4">
//       <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Share this jersey</p>
//       <div className="mt-3 flex flex-wrap items-center gap-2">
//         <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
//           className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-4 text-sm font-black uppercase tracking-wide text-lime-foreground transition-transform hover:scale-105">
//           <Link2 className="h-4 w-4" /> WhatsApp
//         </a>
//         <Button variant="outline" className="gap-2" onClick={copyLink}>
//           <Link2 className="h-4 w-4 text-lime" /> Copy Link
//         </Button>
//         {canNativeShare ? (
//           <Button variant="ghost" className="gap-2" onClick={nativeShare}>
//             <Share2 className="h-4 w-4" /> More options
//           </Button>
//         ) : null}
//       </div>
//       <p className="mt-2 text-[11px] text-muted-foreground">
//         Send the design to your squad on WhatsApp or copy the link to share anywhere.
//       </p>
//     </div>
//   );
// }


import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/kit";

/**
 * Share icon button. Clicking it opens a modal with:
 * WhatsApp, Copy Link and More options (native share sheet).
 */
export function ShareWidget({ name, code }: { name: string; code: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const text = `${name} (${code}) — Jersey Fit. Check out this jersey:`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;

  const openModal = () => {
    setUrl(window.location.href); // read the real link when the user clicks
    setCopied(false);
    setOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Product link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link — select it in the box below and copy it manually.");
    }
  };

  const moreOptions = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: name, text, url });
      } catch {
        /* user closed the share sheet */
      }
    } else {
      await copyLink();
      toast("Share menu isn't available on this device, so the link was copied.");
    }
  };

  const action =
    "flex w-full items-center gap-3 rounded-xl border border-border bg-surface/60 p-3 text-left transition hover:border-lime/60 hover:bg-surface-2";

  return (
    <>
      {/* <button
        type="button"
        onClick={openModal}
        aria-label="Share this jersey"
        title="Share"
        className="inline-grid h-12 w-12 place-items-center rounded-full border border-lime/60 bg-lime/10 text-lime shadow-lg transition-all hover:scale-105 hover:bg-lime/20 hover:glow active:scale-95"
      >
        <Share2 className="h-5 w-5" />
      </button> */}
      <button
  type="button"
  onClick={openModal}
  aria-label="Share this jersey"
  title="Share"
  className="inline-flex h-11 items-center gap-2 rounded-full border border-lime/60 bg-lime/10 px-4 text-lime shadow-lg transition-all hover:scale-105 hover:bg-lime/20 hover:glow active:scale-95"
>
  <Share2 className="h-5 w-5" />
  <span className="text-xs font-black uppercase tracking-wider">
    Share
  </span>
</button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share this jersey">
        <p className="text-sm font-extrabold">{name}</p>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{code}</p>

        <div className="mt-5 space-y-3">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={action}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-lime-foreground">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">WhatsApp</span>
              <span className="block text-xs text-muted-foreground">Send this design to your squad</span>
            </span>
          </a>

          <button type="button" onClick={copyLink} className={action}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-heat text-primary-foreground">
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">{copied ? "Link copied!" : "Copy Link"}</span>
              <span className="block text-xs text-muted-foreground">Paste it anywhere you like</span>
            </span>
          </button>

          <button type="button" onClick={moreOptions} className={action}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-foreground">
              <Share2 className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold">More options</span>
              <span className="block text-xs text-muted-foreground">Instagram, Telegram, Messages and more</span>
            </span>
          </button>
        </div>

        <input
          readOnly
          value={url}
          aria-label="Product link"
          onFocus={(e) => e.currentTarget.select()}
          className="mt-4 h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-xs text-muted-foreground"
        />
      </Modal>
    </>
  );
}
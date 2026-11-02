import { toast } from "sonner";
import { Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/kit";

/**
 * Share widget for the product details page:
 * WhatsApp share, copy-link with toast, and native share on supporting devices.
 */
export function ShareWidget({ name, code }: { name: string; code: string }) {
  const url = typeof window === "undefined" ? "" : window.location.href;
  const text = `${name} (${code}) — Jersey Fit. Check out this jersey: ${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Product link copied");
    } catch {
      toast.error("Could not copy the link — long-press the address bar instead.");
    }
  };

  const nativeShare = () => {
    navigator.share?.({ title: name, text, url }).catch(() => {
      /* user dismissed the sheet */
    });
  };

  return (
    <div className="panel mt-5 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Share this jersey</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-4 text-sm font-black uppercase tracking-wide text-lime-foreground transition-transform hover:scale-105">
          <Link2 className="h-4 w-4" /> WhatsApp
        </a>
        <Button variant="outline" className="gap-2" onClick={copyLink}>
          <Link2 className="h-4 w-4 text-lime" /> Copy Link
        </Button>
        {canNativeShare ? (
          <Button variant="ghost" className="gap-2" onClick={nativeShare}>
            <Share2 className="h-4 w-4" /> More options
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Send the design to your squad on WhatsApp or copy the link to share anywhere.
      </p>
    </div>
  );
}

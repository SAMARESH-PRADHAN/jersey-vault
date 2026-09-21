import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ----------------------------- Button ----------------------------- */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-extrabold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary: "bg-heat text-primary-foreground hover:glow",
        lime: "bg-lime text-lime-foreground hover:brightness-110",
        outline: "border border-border bg-surface/60 text-foreground hover:bg-surface-2",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

/* ----------------------------- Input ----------------------------- */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export function Input({ label, error, id, className, ...props }: FieldProps) {
  const fieldId = id ?? `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "h-11 w-full rounded-xl border bg-background/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/70",
          error ? "border-destructive" : "border-input",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

export function Textarea({
  label,
  error,
  id,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string | null }) {
  const fieldId = id ?? `t-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={cn(
          "w-full rounded-xl border bg-background/60 p-4 text-sm",
          error ? "border-destructive" : "border-input",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

/* ----------------------------- Card ----------------------------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("panel p-5", className)}>{children}</div>;
}

/* ----------------------------- Modal ----------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Dialog"}
        >
          <motion.div
            className={cn(
              "panel max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-2xl",
              wide ? "max-w-2xl" : "max-w-md",
            )}
            initial={{ y: 40, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              {title ? <h2 className="text-2xl">{title}</h2> : <span />}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ----------------------------- Skeleton ----------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function ProductSkeleton() {
  return (
    <div className="panel overflow-hidden p-0">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

/* ----------------------------- Stars ----------------------------- */
export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true"
          className={i <= Math.round(rating) ? "text-accent" : "text-muted"}>
          <path fill="currentColor" d="M10 1.5l2.6 5.3 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.5 7.6l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {kicker ? (
        <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-lime">{kicker}</span>
      ) : null}
      <h2 className="mt-2 text-3xl sm:text-4xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {sub ? <p className="mt-3 text-sm text-muted-foreground sm:text-base">{sub}</p> : null}
    </div>
  );
}

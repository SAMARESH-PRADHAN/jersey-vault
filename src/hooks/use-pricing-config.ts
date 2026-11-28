import { useEffect, useState } from "react";
import { callBackendApi } from "@/lib/api-client";
import type { Product } from "@/types";

export interface DiscountTier {
  min: number;
  max: number | null;
  pct: number;
}
export interface PrintCharges {
  logo: number;
  name: number;
  number: number;
}
export type Family = "customisable" | "readymade";

export interface PricingConfig {
  family: Family;
  moq: number;
  maxQty: number | null;
  discountTiers: DiscountTier[];
  printTypes: string[];
  printCharges: PrintCharges;
  printChargesByType: Record<string, PrintCharges>;
  printDescriptionsByType: Record<string, { logo: string; name: string; number: string }>;
  addOnsAllowed: { logo: boolean; name: boolean; number: boolean };
  rosterThreshold: number;
}

export const DEFAULT_TIERS: DiscountTier[] = [
  { min: 10, max: 22, pct: 10 },
  { min: 23, max: 40, pct: 20 },
  { min: 41, max: 70, pct: 30 },
  { min: 71, max: null, pct: 40 },
];

export const pctForQty = (qty: number, tiers: DiscountTier[]) =>
  tiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max))?.pct ?? 0;

export const tierLabel = (t: DiscountTier) =>
  t.max === null ? `${t.min}+ pcs` : `${t.min} – ${t.max} pcs`;

export function defaultsFor(family: Family): PricingConfig {
  return family === "readymade"
    ? {
        family,
        moq: 1,
        maxQty: 3,
        discountTiers: [],
        printTypes: [],
        printCharges: { logo: 0, name: 0, number: 0 },
        printChargesByType: {},
        printDescriptionsByType: {},
        addOnsAllowed: { logo: false, name: false, number: false },
        rosterThreshold: 15,
      }
    : {
        family,
        moq: 5,
        maxQty: null,
        discountTiers: DEFAULT_TIERS,
        printTypes: ["Sublimation Print", "DTF Print", "No Print"],
        printCharges: { logo: 40, name: 30, number: 30 },
        printChargesByType: {},
        printDescriptionsByType: {},
        addOnsAllowed: { logo: true, name: true, number: true },
        rosterThreshold: 15,
      };
}

function normalize(raw: any, family: Family): PricingConfig {
  const base = defaultsFor(family);
  return {
    family,
    moq: Number(raw?.moq) || base.moq,
    maxQty: raw?.maxQty ?? base.maxQty,
    discountTiers: raw?.discountTiers ?? base.discountTiers,
    printTypes: raw?.printTypes ?? base.printTypes,
    printCharges: raw?.printCharges ?? base.printCharges,
    printChargesByType: raw?.printChargesByType ?? {},
    printDescriptionsByType: raw?.printDescriptionsByType ?? {},
    addOnsAllowed: raw?.addOnsAllowed ?? base.addOnsAllowed,
    rosterThreshold: raw?.rosterThreshold ?? base.rosterThreshold,
  };
}

// Small cache so a page with 20 product cards makes only a few requests.
const cache = new Map<string, { at: number; cfg: PricingConfig }>();
const inflight = new Map<string, Promise<PricingConfig>>();
const TTL = 15_000;

function loadConfig(
  key: string,
  family: Family,
  category: string,
  sub: string | undefined,
  force: boolean,
): Promise<PricingConfig> {
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.cfg);
  const running = inflight.get(key);
  if (running) return running;

  const p = callBackendApi("storefront.resolvePricingConfig", {
    family,
    category,
    subCategory: sub,
  })
    .then((raw) => {
      const cfg = normalize(raw, family);
      cache.set(key, { at: Date.now(), cfg });
      return cfg;
    })
    .catch(() => defaultsFor(family))
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, p);
  return p;
}

type PricingProduct = Pick<
  Product,
  "id" | "family" | "dbCategory" | "category" | "subCategory" | "isExclusiveTopWear"
>;

export function usePricingConfig(product: PricingProduct): PricingConfig {
  const family: Family = product.family ?? (product.isExclusiveTopWear ? "readymade" : "customisable");
  const category = String(product.dbCategory ?? product.category);
  const sub = product.subCategory;
  const key = `${family}|${category}|${sub ?? ""}`;

  const [cfg, setCfg] = useState<PricingConfig>(
    () => cache.get(key)?.cfg ?? { ...defaultsFor(family), discountTiers: [] },
  );

  useEffect(() => {
    let alive = true;
    const run = (force: boolean) =>
      loadConfig(key, family, category, sub, force).then((c) => {
        if (alive) setCfg(c);
      });
    void run(false);
    const onFocus = () => void run(true); // refresh when you come back from the admin tab
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
    };
  }, [key]);

  return cfg;
}

export function useDiscountTiers(product: PricingProduct): DiscountTier[] {
  return usePricingConfig(product).discountTiers;
}
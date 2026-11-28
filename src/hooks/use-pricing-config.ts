import { useEffect, useState } from "react";
import { callBackendApi } from "@/lib/api-client";
import type { Product } from "@/types";

export interface DiscountTier {
  min: number;
  max: number | null;
  pct: number;
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

export function useDiscountTiers(
  product: Pick<Product, "id" | "family" | "dbCategory" | "category" | "subCategory" | "isExclusiveTopWear">,
): DiscountTier[] {
  const [tiers, setTiers] = useState<DiscountTier[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      callBackendApi("storefront.resolvePricingConfig", {
        family: product.family ?? (product.isExclusiveTopWear ? "readymade" : "customisable"),
        category: product.dbCategory ?? product.category,
        subCategory: product.subCategory,
      })
        .then((cfg) => {
          if (alive) setTiers(cfg?.discountTiers ?? []);
        })
        .catch(() => {
          if (alive) setTiers(product.isExclusiveTopWear ? [] : DEFAULT_TIERS);
        });

    void load();
    window.addEventListener("focus", load); // refresh when you come back from admin tab
    return () => {
      alive = false;
      window.removeEventListener("focus", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product.family, product.dbCategory, product.subCategory]);

  return tiers;
}
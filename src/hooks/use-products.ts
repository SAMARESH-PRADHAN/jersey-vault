import { useEffect, useState } from "react";
import { callBackendApi } from "@/lib/api-client";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";

let cachedProducts: Product[] | null = null;
const listeners = new Set<(products: Product[]) => void>();

function notify(products: Product[]) {
  cachedProducts = products;
  listeners.forEach((fn) => fn(products));
}

// Convert backend product record to Storefront Product format
function mapBackendProduct(bp: any): Product {
  let mappedCategory: any = bp.category;
  if (bp.category === "custom-team-jersey" && bp.subCategory) {
    mappedCategory = bp.subCategory;
  }

  return {
    id: bp.id,
    code: bp.code || "JF-001",
    name: bp.name,
    category: mappedCategory,
    price: Number(bp.price) || 699,
    mrp: Number(bp.mrp) || 999,
    material: bp.material || "Dry-Fit Interlock Polyester",
    description: bp.description || "High-performance sports jersey engineered for comfort and durability.",
    images: Array.isArray(bp.images) && bp.images.length > 0 ? bp.images : [bp.image || "/assets/jersey-1.jpg"],
    rating: Number(bp.rating) || 4.8,
    tag: bp.tag || undefined,
    isExclusiveTopWear: Boolean(bp.isExclusiveTopWear),
    subCategory: bp.subCategory || undefined,
  };
}

export function useLiveProducts(initialFallback = PRODUCTS) {
  const [products, setProducts] = useState<Product[]>(cachedProducts || initialFallback);

  useEffect(() => {
    const handler = (next: Product[]) => setProducts(next);
    listeners.add(handler);

    // Fetch from backend
    callBackendApi("storefront.listProducts", { page: 1, pageSize: 200 })
      .then((res) => {
        if (res && Array.isArray(res.products) && res.products.length > 0) {
          const liveList = res.products.map(mapBackendProduct);
          // Merge: include newly added DB products + fallback products if not overridden
          const liveIds = new Set(liveList.map((p) => p.id));
          const combined = [...liveList, ...initialFallback.filter((p) => !liveIds.has(p.id))];
          notify(combined);
        }
      })
      .catch((err) => {
        console.warn("Could not load products from backend API:", err?.message);
      });

    return () => {
      listeners.delete(handler);
    };
  }, [initialFallback]);

  return products;
}

export async function fetchLiveProduct(id: string): Promise<Product | null> {
  try {
    const res = await callBackendApi("storefront.getProduct", { id });
    if (res) {
      return mapBackendProduct(res);
    }
  } catch (err) {
    // fallback
  }
  return null;
}

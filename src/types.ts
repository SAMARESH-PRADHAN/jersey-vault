export type CategorySlug =
  | "all-over-print"
  | "front-print"
  | "back-print"
  | "cricket"
  | "football"
  | "volleyball"
  | "basketball"
  | "kabaddi"
  | "ganesh-puja"
  | "morning-walk"
  | "marathon"
  | "top-wear"
  | "winter-top-wear";

export type TopWearSubCategory = "all" | "round-neck" | "polo-neck";
export type WinterSubCategory = "all" | "hoodie" | "sweatshirt" | "oversized-tshirt";

export interface Product {
  id: string;
  code: string;
  name: string;
  category: CategorySlug;
  price: number;
  mrp: number;
  material: string;
  description: string;
  images: string[];
  rating: number;
  tag?: string;
  isExclusiveTopWear?: boolean;
  subCategory?: "round-neck" | "polo-neck" | "hoodie" | "sweatshirt" | "oversized-tshirt";
}

export type PrintType = "Sublimation Print" | "DTF Print" | "No Print";
export type PrintCategory = "Logo" | "Name" | "Number";

export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

export interface PersonRow {
  key: string;
  size: Size;
  name: string;
  number: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  code: string;
  image: string;
  unitPrice: number;
  printType: PrintType;
  printCategories: PrintCategory[];
  logo?: string;
  sizes: { size: Size; qty: number }[];
  rows: PersonRow[];
  note: string;
  totalQty: number;
  lineTotal: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  house: string;
  city: string;
  state: string;
  isDefault: boolean;
}

export const ORDER_STATUSES = [
  "Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  address: Address;
  payment: string;
  subtotal: number;
  discount: number;
  coupon?: string | undefined;
  gst: number;
  total: number;
  statusIndex: number;
  reviewedProducts: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  provider?: "google" | "email";
}

export interface Review {
  id: string;
  productId: string;
  user: string;
  rating: number;
  text: string;
  date: string;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { KEYS, read, uid, write } from "@/lib/storage";
import { SEED_REVIEWS, PRODUCTS } from "@/data/products";
import type { Address, CartItem, Order, Review, User } from "@/types";

/**
 * Single app store (auth + cart + addresses + orders + reviews + coupons).
 * SWAP POINT: each localStorage read/write below maps 1:1 to an API call.
 */

export interface Coupon {
  code: string;
  label: string;
  flat: number;
  minSubtotal: number;
}

export const COUPONS: Coupon[] = [
  { code: "JERSEY100", label: "Flat ₹100 off", flat: 100, minSubtotal: 0 },
  { code: "FIT200", label: "Flat ₹200 off above ₹2,000", flat: 200, minSubtotal: 2000 },
  { code: "SQUAD500", label: "Flat ₹500 off above ₹6,000", flat: 500, minSubtotal: 6000 },
];

export const GST_RATE = 0.05;

interface AppState {
  ready: boolean;
  user: User | null;
  signup: (d: { name: string; email: string; phone: string; password: string }) => string | null;
  login: (email: string, password: string) => string | null;
  loginWithGoogle: () => void;
  logout: () => void;
  authOpen: boolean;
  openAuth: (redirectTo?: string) => void;
  closeAuth: () => void;
  authRedirect: string | null;

  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;

  coupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  totals: { subtotal: number; discount: number; gst: number; total: number };

  addresses: Address[];
  saveAddress: (a: Omit<Address, "id">, id?: string) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  orders: Order[];
  placeOrder: (address: Address, payment: string) => Order;
  advanceOrder: (id: string) => void;

  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "date">, orderId?: string) => void;
  productReviews: (productId: string) => Review[];
}

const Ctx = createContext<AppState | null>(null);

function seedReviews(): Review[] {
  return SEED_REVIEWS.map((r, i) => ({
    id: `seed_${i}`,
    productId: PRODUCTS[i % PRODUCTS.length]!.id,
    user: r.user,
    rating: r.rating,
    text: r.text,
    date: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRedirect, setAuthRedirect] = useState<string | null>(null);

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    setUser(read<User | null>(KEYS.session, null));
    setCart(read<CartItem[]>(KEYS.cart, []));
    setAddresses(read<Address[]>(KEYS.addresses, []));
    setOrders(read<Order[]>(KEYS.orders, []));
    const stored = read<Review[] | null>(KEYS.reviews, null);
    if (stored && stored.length) setReviews(stored);
    else {
      const s = seedReviews();
      setReviews(s);
      write(KEYS.reviews, s);
    }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) write(KEYS.cart, cart); }, [cart, ready]);
  useEffect(() => { if (ready) write(KEYS.addresses, addresses); }, [addresses, ready]);
  useEffect(() => { if (ready) write(KEYS.orders, orders); }, [orders, ready]);
  useEffect(() => { if (ready) write(KEYS.reviews, reviews); }, [reviews, ready]);

  /* ---------------- auth ---------------- */
  const signup: AppState["signup"] = (d) => {
    const users = read<User[]>(KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === d.email.toLowerCase()))
      return "An account with this email already exists.";
    const u: User = { id: uid("usr"), ...d, provider: "email" };
    write(KEYS.users, [...users, u]);
    write(KEYS.session, u);
    setUser(u);
    toast.success(`Welcome to Jersey Fit, ${u.name.split(" ")[0]}!`);
    return null;
  };

  const login: AppState["login"] = (email, password) => {
    const users = read<User[]>(KEYS.users, []);
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return "No account found with this email.";
    if (u.password !== password) return "Incorrect password.";
    write(KEYS.session, u);
    setUser(u);
    toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
    return null;
  };

  // Mock Google OAuth — swap for a real provider SDK later.
  const loginWithGoogle = () => {
    const users = read<User[]>(KEYS.users, []);
    const email = "demo.player@gmail.com";
    let u = users.find((x) => x.email === email);
    if (!u) {
      u = { id: uid("usr"), name: "Demo Player", email, phone: "9876543210", provider: "google" };
      write(KEYS.users, [...users, u]);
    }
    write(KEYS.session, u);
    setUser(u);
    toast.success("Signed in with Google");
  };

  const logout = () => {
    write(KEYS.session, null);
    setUser(null);
    toast("Logged out");
  };

  const openAuth = (redirectTo?: string) => {
    setAuthRedirect(redirectTo ?? null);
    setAuthOpen(true);
  };
  const closeAuth = () => setAuthOpen(false);

  /* ---------------- cart ---------------- */
  const addToCart = (item: CartItem) => {
    setCart((c) => [...c, item]);
    toast.success("Added to cart", { description: `${item.name} · ${item.totalQty} pcs` });
  };
  const removeFromCart = (id: string) => {
    setCart((c) => c.filter((i) => i.id !== id));
    toast("Item removed from cart");
  };
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);
  const discount = coupon && subtotal >= coupon.minSubtotal ? Math.min(coupon.flat, subtotal) : 0;
  const gst = (subtotal - discount) * GST_RATE;
  const totals = {
    subtotal,
    discount,
    gst,
    total: subtotal - discount + gst,
  };

  const applyCoupon = (code: string) => {
    const c = COUPONS.find((x) => x.code === code.trim().toUpperCase());
    if (!c) {
      toast.error("Invalid coupon code");
      return false;
    }
    if (subtotal < c.minSubtotal) {
      toast.error(`Add ₹${c.minSubtotal - subtotal} more to use ${c.code}`);
      return false;
    }
    setCoupon(c);
    toast.success(`${c.code} applied — ${c.label}`);
    return true;
  };
  const removeCoupon = () => {
    setCoupon(null);
    toast("Coupon removed");
  };

  /* ---------------- addresses ---------------- */
  const saveAddress: AppState["saveAddress"] = (a, id) => {
    setAddresses((list) => {
      let next = id
        ? list.map((x) => (x.id === id ? { ...a, id } : x))
        : [...list, { ...a, id: uid("adr") }];
      const targetId = id ?? next[next.length - 1]?.id;
      if (a.isDefault) next = next.map((x) => ({ ...x, isDefault: x.id === targetId }));
      if (!next.some((x) => x.isDefault) && next[0]) next[0] = { ...next[0], isDefault: true };
      return next;
    });
    toast.success(id ? "Address updated" : "Address added");
  };
  const deleteAddress = (id: string) => {
    setAddresses((l) => l.filter((x) => x.id !== id));
    toast("Address deleted");
  };
  const setDefaultAddress = (id: string) => {
    setAddresses((l) => l.map((x) => ({ ...x, isDefault: x.id === id })));
    toast.success("Default address updated");
  };

  /* ---------------- orders ---------------- */
  const placeOrder: AppState["placeOrder"] = (address, payment) => {
    const order: Order = {
      id: `JF${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      items: cart,
      address,
      payment,
      subtotal: totals.subtotal,
      discount: totals.discount,
      coupon: coupon?.code,
      gst: totals.gst,
      total: totals.total,
      statusIndex: 0,
      reviewedProducts: [],
    };
    setOrders((o) => [order, ...o]);
    setCart([]);
    setCoupon(null);
    return order;
  };

  const advanceOrder = (id: string) => {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, statusIndex: Math.min(4, o.statusIndex + 1) } : o)),
    );
  };

  /* ---------------- reviews ---------------- */
  const addReview: AppState["addReview"] = (r, orderId) => {
    setReviews((l) => [{ ...r, id: uid("rev"), date: new Date().toISOString() }, ...l]);
    if (orderId)
      setOrders((list) =>
        list.map((o) =>
          o.id === orderId
            ? { ...o, reviewedProducts: [...o.reviewedProducts, r.productId] }
            : o,
        ),
      );
    toast.success("Thanks for your review!");
  };

  const productReviews = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews],
  );

  const value = useMemo<AppState>(
    () => ({
      ready, user, signup, login, loginWithGoogle, logout,
      authOpen, openAuth, closeAuth, authRedirect,
      cart, addToCart, removeFromCart, clearCart,
      cartCount: cart.reduce((s, i) => s + i.totalQty, 0),
      coupon, applyCoupon, removeCoupon, totals,
      addresses, saveAddress, deleteAddress, setDefaultAddress,
      orders, placeOrder, advanceOrder,
      reviews, addReview, productReviews,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, user, authOpen, authRedirect, cart, coupon, addresses, orders, reviews],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

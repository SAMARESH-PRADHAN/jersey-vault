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
// import { SEED_REVIEWS, PRODUCTS } from "@/data/products";
import { callBackendApi } from "@/lib/api-client";
import type { Address, CartItem, Order, Review, User } from "@/types";

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
  signup: (d: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<string | null> | string | null;
  login: (email: string, password: string) => Promise<string | null> | string | null;
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
  applyCoupon: (code: string) => Promise<boolean> | boolean;
  removeCoupon: () => void;
  totals: { subtotal: number; discount: number; gst: number; total: number };

  addresses: Address[];
  saveAddress: (a: Omit<Address, "id">, id?: string) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  orders: Order[];
  refreshOrders: () => Promise<void>;
  placeOrder: (address: Address, payment: string, payMode?: "full" | "advance") => Promise<Order>;
  payBalance: (id: string) => void;
  advanceOrder: (id: string) => void;

  reviews: Review[];
  addReview: (r: Omit<Review, "id" | "date">, orderId?: string) => Promise<void>;
  productReviews: (productId: string) => Review[];
}

const Ctx = createContext<AppState | null>(null);

// function seedReviews(): Review[] {
//   return SEED_REVIEWS.map((r, i) => ({
//     id: `seed_${i}`,
//     productId: PRODUCTS[i % PRODUCTS.length]?.id ?? "p1",
//     user: r.user,
//     rating: r.rating,
//     text: r.text,
//     date: new Date(Date.now() - (i + 2) * 86400000).toISOString(),
//   }));
// }

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

  // Hydrate from localStorage first, then sync with backend
  useEffect(() => {
    const cachedUser = read<User | null>(KEYS.session, null);
    setUser(cachedUser);
    setCart(read<CartItem[]>(KEYS.cart, []));
    if (cachedUser?.email) {
      const emailKey = cachedUser.email.toLowerCase();
      setAddresses(read<Address[]>(`${KEYS.addresses}_${emailKey}`, []));
      setOrders(read<Order[]>(`${KEYS.orders}_${emailKey}`, []));
    } else {
      setAddresses([]);
      setOrders([]);
    }
    // const stored = read<Review[] | null>(KEYS.reviews, null);
    // if (stored && stored.length) {
    //   setReviews(stored);
    // } else {
    //   const s = seedReviews();
    //   setReviews(s);
    //   write(KEYS.reviews, s);
    // }
    // setReady(true);

    // // Fetch live reviews from backend in background
    // callBackendApi("storefront.listProductReviews")
    //   .then((serverReviews) => {
    //     if (Array.isArray(serverReviews) && serverReviews.length > 0) {
    //       const mapped: Review[] = serverReviews.map((sr: any) => ({
    //         id: sr.id || uid("rev"),
    //         productId: sr.productId,
    //         user: sr.customerName || sr.user || "Customer",
    //         rating: Number(sr.rating) || 5,
    //         text: sr.reviewText || sr.comment || sr.text || "",
    //         date: sr.createdAt || new Date().toISOString(),
    //       }));
    //       setReviews((prev) => {
    //         const combined = [...mapped, ...prev.filter((p) => !mapped.some((m) => m.id === p.id))];
    //         write(KEYS.reviews, combined);
    //         return combined;
    //       });
    //     }
    //   })
    //   .catch(() => {
    //     // Fallback to local
    //   });
        // Reviews: only from local cache or backend — never seed demo reviews
    const stored = read<Review[]>(KEYS.reviews, []);
    setReviews(stored);
    setReady(true);

    // Fetch live reviews from backend
    callBackendApi("storefront.listProductReviews")
      .then((serverReviews) => {
        if (Array.isArray(serverReviews)) {
          const mapped: Review[] = serverReviews.map((sr: any) => ({
            id: sr.id || uid("rev"),
            productId: sr.productId,
            user: sr.customerName || sr.user || "Customer",
            rating: Number(sr.rating) || 5,
            text: sr.reviewText || sr.comment || sr.text || "",
            date: sr.createdAt || new Date().toISOString(),
          }));
          // Use API list only (empty array if DB has no reviews)
          setReviews(mapped);
          write(KEYS.reviews, mapped);
        }
      })
      .catch(() => {
        // Keep whatever was already in localStorage; do not invent seed data
      });
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user?.email) return;
    try {
      const serverOrders = await callBackendApi("storefront.getCustomerOrders", {
        email: user.email,
        userId: user.id,
      });
      if (Array.isArray(serverOrders)) {
        setOrders((localOrders) => {
          const mappedServer: Order[] = serverOrders.map((so: any) => {
            const matchedLocal = localOrders.find((lo) => lo.id === so.id);
            const items: CartItem[] = (so.items || []).map((si: any) => ({
              id: si.id,
              productId: si.productId,
              name: si.productName,
              code: si.productCode || "JF",
              image: si.logoFileUrl || "/assets/jersey-1.jpg",
              unitPrice: si.unitPrice,
              printType: si.printType || "Sublimation Print",
              printCategories: si.addOns || [],
              sizes: [{ size: si.size, qty: si.quantity }],
              rows: (si.names || []).map((name: string, idx: number) => ({
                key: `r-${idx}`,
                size: si.size,
                name,
                number: si.numbers?.[idx] || "",
              })),
              note: si.note || "",
              totalQty: si.quantity,
              lineTotal: si.unitPrice * si.quantity,
            }));

            return {
              id: so.id,
              date: so.createdAt || new Date().toISOString(),
              items: items.length > 0 ? items : matchedLocal?.items || [],
              address: so.address ||
                matchedLocal?.address || {
                  id: "adr",
                  name: so.customerName,
                  phone: so.customerPhone,
                  pincode: "400001",
                  house: so.address?.line || "",
                  city: so.address?.city || "",
                  state: so.address?.state || "India",
                  isDefault: true,
                },
              payment: so.paymentMethod,
              payMode: so.payMode,
              amountPaid: so.amountPaid,
              balancePaid: so.balancePaid === 0,
              subtotal: so.subtotal,
              discount: so.discount,
              coupon: so.coupon || undefined,
              gst: so.gst,
              total: so.total,
              statusIndex: so.statusIndex ?? 0,
              reviewedProducts: matchedLocal?.reviewedProducts || [],
            };
          });

          // Store isolated per user email
          write(`${KEYS.orders}_${user.email.toLowerCase()}`, mappedServer);
          return mappedServer;
        });
      }
    } catch (err) {
      console.warn("Could not sync customer orders from backend:", err);
    }
  }, [user?.email, user?.id]);

  // Sync customer orders from backend whenever user is logged in & set up polling
  useEffect(() => {
    if (!ready || !user?.email) return;
    void refreshOrders();

    const interval = setInterval(() => {
      void refreshOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [ready, user?.email, refreshOrders]);

  /* ---------------- auth ---------------- */
  const signup: AppState["signup"] = async (d) => {
    try {
      const serverUser = await callBackendApi("storefront.signup", {
        name: d.name,
        email: d.email,
        phone: d.phone,
        password: d.password,
      });

      if (serverUser && serverUser.id) {
        const u: User = {
          id: serverUser.id,
          name: serverUser.name,
          email: serverUser.email,
          phone: serverUser.phone,
          provider: "email",
        };
        write(KEYS.session, u);
        setUser(u);
        const emailKey = u.email.toLowerCase();
        setAddresses(read<Address[]>(`${KEYS.addresses}_${emailKey}`, []));
        setOrders(read<Order[]>(`${KEYS.orders}_${emailKey}`, []));
        toast.success(`Welcome to Jersey Fit, ${u.name.split(" ")[0]}!`);
        return null;
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("failed with status")) {
        return err.message;
      }
    }

    // Local fallback if offline
    const users = read<User[]>(KEYS.users, []);
    if (users.some((u) => u.email.toLowerCase() === d.email.toLowerCase()))
      return "An account with this email already exists.";
    const u: User = { id: uid("usr"), ...d, provider: "email" };
    write(KEYS.users, [...users, u]);
    write(KEYS.session, u);
    setUser(u);
    const emailKey = u.email.toLowerCase();
    setAddresses(read<Address[]>(`${KEYS.addresses}_${emailKey}`, []));
    setOrders(read<Order[]>(`${KEYS.orders}_${emailKey}`, []));
    toast.success(`Welcome to Jersey Fit, ${u.name.split(" ")[0]}!`);
    return null;
  };

  const login: AppState["login"] = async (email, password) => {
    try {
      const serverUser = await callBackendApi("storefront.login", {
        email,
        password,
      });

      if (serverUser && serverUser.id) {
        const u: User = {
          id: serverUser.id,
          name: serverUser.name,
          email: serverUser.email,
          phone: serverUser.phone,
          provider: "email",
        };
        write(KEYS.session, u);
        setUser(u);
        const emailKey = u.email.toLowerCase();
        setAddresses(read<Address[]>(`${KEYS.addresses}_${emailKey}`, []));
        setOrders(read<Order[]>(`${KEYS.orders}_${emailKey}`, []));
        toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
        return null;
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes("failed with status")) {
        return err.message;
      }
    }

    // Local fallback if offline
    const users = read<User[]>(KEYS.users, []);
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return "No account found with this email.";
    if (u.password !== password) return "Incorrect password.";
    write(KEYS.session, u);
    setUser(u);
    const emailKey = u.email.toLowerCase();
    setAddresses(read<Address[]>(`${KEYS.addresses}_${emailKey}`, []));
    setOrders(read<Order[]>(`${KEYS.orders}_${emailKey}`, []));
    toast.success(`Welcome back, ${u.name.split(" ")[0]}!`);
    return null;
  };

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
    setOrders([]);
    setAddresses([]);
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

  const applyCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();

    // First validate with backend admin API
    try {
      const serverRes = await callBackendApi("storefront.validateCoupon", {
        code: cleanCode,
        subtotal,
      });

      if (serverRes && serverRes.valid) {
        const c: Coupon = {
          code: serverRes.coupon?.code || cleanCode,
          label: serverRes.coupon?.name || `Flat ₹${serverRes.discount} off`,
          flat: Number(serverRes.discount) || 0,
          minSubtotal: Number(serverRes.coupon?.minSubtotal) || 0,
        };
        setCoupon(c);
        toast.success(`${c.code} applied — ${c.label}`);
        return true;
      }
    } catch {
      // Fallback to local coupons
    }

    const c = COUPONS.find((x) => x.code === cleanCode);
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

      if (user?.email) {
        write(`${KEYS.addresses}_${user.email.toLowerCase()}`, next);
      }
      return next;
    });
    toast.success(id ? "Address updated" : "Address added");
  };
  const deleteAddress = (id: string) => {
    setAddresses((l) => {
      const next = l.filter((x) => x.id !== id);
      if (user?.email) {
        write(`${KEYS.addresses}_${user.email.toLowerCase()}`, next);
      }
      return next;
    });
    toast("Address deleted");
  };
  const setDefaultAddress = (id: string) => {
    setAddresses((l) => {
      const next = l.map((x) => ({ ...x, isDefault: x.id === id }));
      if (user?.email) {
        write(`${KEYS.addresses}_${user.email.toLowerCase()}`, next);
      }
      return next;
    });
    toast.success("Default address updated");
  };

  /* ---------------- orders ---------------- */
  const placeOrder: AppState["placeOrder"] = async (address, payment, payMode = "full") => {
    const advance = payMode === "advance";
    let orderId = `JF${Date.now().toString().slice(-8)}`;

    // Map cart items to backend RPC format
    const backendCartItems = cart.map((i) => ({
      productId: i.productId,
      quantity: i.totalQty,
      size: i.sizes?.[0]?.size || "M",
      printType: i.printType,
      addOns: i.printCategories || [],
      names: i.rows?.filter((r) => r.name).map((r) => r.name) || [],
      numbers: i.rows?.filter((r) => r.number).map((r) => r.number) || [],
      note: i.note || "",
      logoFileUrl: i.logo || undefined,
      rosterFileName: i.rosterName || undefined,
    }));

    // Post to Admin Studio Backend
    try {
      const serverResult = await callBackendApi("storefront.createOrder", {
        cart: backendCartItems,
        customer: {
          id: user?.id,
          name: address.name || user?.name || "Customer",
          email: user?.email || "customer@example.com",
          phone: address.phone || user?.phone || "9876543210",
          city: address.city || "Mumbai",
        },
        address: {
          line: address.house || "Address Line",
          city: address.city,
          state: address.state || "India",
          pincode: address.pincode,
          company: address.company || undefined,
          gstin: address.gstin || undefined,
        },
        paymentMethod:
          payment === "Cash on Delivery"
            ? "COD"
            : payment === "Card"
              ? "Card"
              : payment === "Net Banking"
                ? "Net Banking"
                : "UPI",
        payMode,
        couponCode: coupon?.code || undefined,
      });

      if (serverResult?.order?.id) {
        orderId = serverResult.order.id;
      }
    } catch (err: any) {
      console.warn("Could not sync order to backend, saving locally:", err?.message);
    }

    const order: Order = {
      id: orderId,
      date: new Date().toISOString(),
      items: cart,
      address,
      payment,
      payMode,
      amountPaid: advance ? Math.round(totals.total / 2) : totals.total,
      balancePaid: !advance,
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

  const payBalance = (id: string) => {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, balancePaid: true, amountPaid: o.total } : o)),
    );
    toast.success("Remaining 50% paid — your order is fully settled.");
  };

  const advanceOrder = (id: string) => {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, statusIndex: Math.min(4, o.statusIndex + 1) } : o)),
    );
  };

  /* ---------------- reviews ---------------- */
  const addReview: AppState["addReview"] = async (r, orderId) => {
    const newRev: Review = { ...r, id: uid("rev"), date: new Date().toISOString() };
    setReviews((l) => [newRev, ...l]);

    if (orderId) {
      setOrders((list) =>
        list.map((o) =>
          o.id === orderId ? { ...o, reviewedProducts: [...o.reviewedProducts, r.productId] } : o,
        ),
      );
    }

    // Sync review to Admin Studio
    try {
      await callBackendApi("storefront.createReview", {
        productId: r.productId,
        customerName: r.user,
        rating: r.rating,
        reviewText: r.text,
      });
    } catch {
      // Local copy is already retained
    }

    toast.success("Thanks for your review!");
  };

  const productReviews = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews],
  );

  const value = useMemo<AppState>(
    () => ({
      ready,
      user,
      signup,
      login,
      loginWithGoogle,
      logout,
      authOpen,
      openAuth,
      closeAuth,
      authRedirect,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount: cart.reduce((s, i) => s + i.totalQty, 0),
      coupon,
      applyCoupon,
      removeCoupon,
      totals,
      addresses,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      orders,
      refreshOrders,
      placeOrder,
      payBalance,
      advanceOrder,
      reviews,
      addReview,
      productReviews,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, user, authOpen, authRedirect, cart, coupon, addresses, orders, reviews, refreshOrders],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

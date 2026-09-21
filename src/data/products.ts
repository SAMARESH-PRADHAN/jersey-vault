import type { CategorySlug, Product } from "@/types";
import j1 from "@/assets/jersey-1.jpg";
import j2 from "@/assets/jersey-2.jpg";
import j3 from "@/assets/jersey-3.jpg";
import hero from "@/assets/hero-1.jpg";

export const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: "all-over-print", label: "All Over Print Jersey" },
  { slug: "front-print", label: "Front Print Jersey" },
  { slug: "back-print", label: "Back Print Jersey" },
];

export const PRINT_CHARGES = { Logo: 40, Name: 30, Number: 30 } as const;

const gallery = (a: string) => [a, j2, j3, hero].filter((x, i, arr) => arr.indexOf(x) === i);

/** DEMO DATA — replace with GET /api/products later. */
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    code: "JF-AOP-101",
    name: "Voltex Thunder All Over Print Jersey",
    category: "all-over-print",
    price: 749,
    mrp: 1299,
    material: "140 GSM Micro Polyester Interlock",
    description:
      "Full-body sublimated jersey with lightning graphics. Breathable micro-poly knit that stays dry through four quarters.",
    images: gallery(j1),
    rating: 4.7,
    tag: "Bestseller",
  },
  {
    id: "p2",
    code: "JF-AOP-102",
    name: "Nexus Neon Camo Pro Jersey",
    category: "all-over-print",
    price: 899,
    mrp: 1499,
    material: "160 GSM Dry-Fit Honeycomb Polyester",
    description:
      "Neon camo all-over print with mesh side panels for extra airflow. Colour-locked so it never fades in the wash.",
    images: gallery(j2),
    rating: 4.8,
    tag: "New",
  },
  {
    id: "p3",
    code: "JF-AOP-103",
    name: "Turbo Grid Sublimation Jersey",
    category: "all-over-print",
    price: 699,
    mrp: 1199,
    material: "130 GSM Feather-Light Polyester",
    description:
      "Grid-pattern sublimation print, ultra light for summer tournaments and practice sessions.",
    images: gallery(j1),
    rating: 4.5,
  },
  {
    id: "p4",
    code: "JF-AOP-104",
    name: "Apex Gradient Team Jersey",
    category: "all-over-print",
    price: 999,
    mrp: 1699,
    material: "180 GSM Premium Interlock",
    description:
      "Heavyweight premium interlock with a smooth blue-to-orange gradient fade. Club-grade finish.",
    images: gallery(j2),
    rating: 4.9,
    tag: "Premium",
  },
  {
    id: "p5",
    code: "JF-FP-201",
    name: "Strike Front Logo Jersey",
    category: "front-print",
    price: 549,
    mrp: 899,
    material: "150 GSM Sports Dry Polyester",
    description:
      "Clean single-colour body with a bold chest print area. Perfect for club crests and sponsor logos.",
    images: gallery(j1),
    rating: 4.4,
  },
  {
    id: "p6",
    code: "JF-FP-202",
    name: "Academy Chest Print Jersey",
    category: "front-print",
    price: 599,
    mrp: 949,
    material: "145 GSM Matte Dry-Fit",
    description:
      "Matte-finish academy jersey with a wide front print zone. Great for school and college teams.",
    images: gallery(j3),
    rating: 4.3,
  },
  {
    id: "p7",
    code: "JF-FP-203",
    name: "Sponsor Pro Front Print Jersey",
    category: "front-print",
    price: 649,
    mrp: 1099,
    material: "160 GSM Dry-Fit Honeycomb Polyester",
    description:
      "Built for sponsor-heavy kits: three flat print zones on the front that keep logos crisp.",
    images: gallery(j2),
    rating: 4.6,
    tag: "Bulk Pick",
  },
  {
    id: "p8",
    code: "JF-FP-204",
    name: "Court Classic Front Print Jersey",
    category: "front-print",
    price: 579,
    mrp: 999,
    material: "150 GSM Cotton-Feel Polyester",
    description:
      "Cotton-feel comfort with polyester durability. Retro court styling, modern fabric.",
    images: gallery(j1),
    rating: 4.2,
  },
  {
    id: "p9",
    code: "JF-BP-301",
    name: "Numbered Back Print Jersey",
    category: "back-print",
    price: 629,
    mrp: 1049,
    material: "150 GSM Sports Dry Polyester",
    description:
      "Large back panel tuned for names and two-digit numbers with crack-free print adhesion.",
    images: gallery(j3),
    rating: 4.7,
    tag: "Bestseller",
  },
  {
    id: "p10",
    code: "JF-BP-302",
    name: "Legacy Stripe Back Print Jersey",
    category: "back-print",
    price: 699,
    mrp: 1149,
    material: "160 GSM Honeycomb Polyester",
    description:
      "Twin-stripe back design that frames player names beautifully. Squad favourite.",
    images: gallery(j3),
    rating: 4.6,
  },
  {
    id: "p11",
    code: "JF-BP-303",
    name: "Roster Elite Back Print Jersey",
    category: "back-print",
    price: 799,
    mrp: 1349,
    material: "170 GSM Premium Dry Interlock",
    description:
      "Elite-grade roster jersey with reinforced shoulder seams for full-season use.",
    images: gallery(j2),
    rating: 4.8,
  },
  {
    id: "p12",
    code: "JF-BP-304",
    name: "Captain Series Back Print Jersey",
    category: "back-print",
    price: 949,
    mrp: 1599,
    material: "180 GSM Premium Interlock",
    description:
      "Captain-series kit with tonal back panel, armband detail and a luxe stitched hem.",
    images: gallery(j1),
    rating: 4.9,
    tag: "Premium",
  },
  {
    id: "p13",
    code: "JF-AOP-105",
    name: "Blitz Motion All Over Print Jersey",
    category: "all-over-print",
    price: 879,
    mrp: 1449,
    material: "155 GSM Stretch Polyester Spandex",
    description:
      "4-way stretch motion print jersey that moves with fast-paced indoor sports.",
    images: gallery(j2),
    rating: 4.5,
  },
  {
    id: "p14",
    code: "JF-FP-205",
    name: "Street Fit Front Print Jersey",
    category: "front-print",
    price: 519,
    mrp: 879,
    material: "140 GSM Soft Touch Polyester",
    description:
      "Relaxed street-fit jersey — off-court ready with a single bold front graphic.",
    images: gallery(j3),
    rating: 4.1,
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const SEED_REVIEWS = [
  { user: "Rohit Sharma", rating: 5, text: "Ordered 22 jerseys for our club — print quality is unreal and delivery was 4 days early." },
  { user: "Ananya Iyer", rating: 5, text: "Fabric is light but not see-through. Names and numbers look factory perfect." },
  { user: "Karan Mehta", rating: 4, text: "Great value for bulk. Sizing runs true, 2XL fit our keeper well." },
  { user: "Sneha Rao", rating: 5, text: "The all-over print colours are still vivid after 15 washes. Highly recommend." },
  { user: "Vikram Nair", rating: 5, text: "Uploaded our logo and got a proof the same day. Super smooth process." },
  { user: "Priya Das", rating: 4, text: "Neon green looks even better in person. Will reorder for the next season." },
  { user: "Aditya Kulkarni", rating: 5, text: "Sublimation finish feels premium — teammates thought it was a big brand kit." },
];

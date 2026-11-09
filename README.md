# Jersey Vault

Build a premium, colourful, fully responsive, frontend-only e-commerce website called "Jersey Fit" that sells only sports jerseys (top wear). No backend and no admin panel. Use localStorage to simulate users, cart, addresses, orders, coupons and reviews. Seed 12+ demo products with realistic data. Stack: React + Vite + Tailwind CSS + React Router + Framer Motion (or plain HTML/CSS/JS if preferred). Style: bold sporty look with gradients (electric blue, orange, neon green on dark or white), rounded cards, smooth animations, skeleton loaders, toast notifications. Mobile-first, tested at 360px, 768px and 1280px.

1. NAVBAR (sticky)

- Left: logo. Then: Home, Browse Category (dropdown: All Over Print Jersey, Front Print Jersey, Back Print Jersey), Contact.

- Right: Login/Signup button, which becomes a Profile dropdown after login (My Address, My Orders, Logout). Then an animated cart icon with a live item-count badge.

- Mobile: hamburger drawer with an accordion for categories.

2. HOME PAGE (in order)

- Hero: full-width auto-playing slider of images/short muted videos with arrows, dots, swipe support, overlay headline and a "Shop Now" CTA.

- About Us

- Services (icon cards: custom printing, bulk orders, fast delivery, etc.)

- Factory (image gallery and stats counters)

- Our Customers (logo/club strip)

- Customer Reviews: continuous right-to-left auto-scrolling marquee, pause on hover.

- Footer with links, contact and socials.

3. AUTH

- Modal or page with Signup (name, email, phone, password) and Login tabs. Validation with inline errors.

- "Continue with Google" button (mock the flow and save the user in localStorage).

- Session persisted in localStorage. Login is mandatory for Add to Cart, Checkout and Orders. Redirect back to the previous page after login.

4. CATEGORY / PRODUCT LISTING PAGE

- Product grid: image, name, price. Hover effect with a second image.

- Tabs/pills at the top to switch between the 3 categories instantly.

- Price filter (range slider with min/max inputs) and a sort dropdown.

- Empty state and pagination or "load more".

5. PRODUCT DETAILS PAGE

- Gallery with 4 images (thumbnails and zoom).

- Product code, name, material, description, live price.

- Print Type (radio, only 2): Sublimation Print, DTF Print.

- Print Category (checkboxes): Logo, Name, Number.

- Upload Logo (image preview, shown when Logo is checked). One logo applies to all sizes.

- Size and quantity selector (XS to 3XL): each size has a qty stepper, with total quantity auto-calculated. If Name and/or Number is checked, then for each unit of a size show a separate row (e.g. size L qty 5 gives 5 rows) with its own Name and Number input. Validate that all rows are filled.

- Note box.

- Live Total Bill (unit price x total qty, plus print charges if any).

- "Add to Cart" button (asks for login if logged out).

- Below: tabs/accordion for Wash Care, Product Overview and Design Guidelines.

- Product Reviews (rating summary and list), then Related Products carousel.

6. CART

- List of items with details (print type, sizes, names/numbers, logo thumbnail), a delete button, and a qty summary.

- Bill summary: subtotal, coupon discount, 5% GST, grand total.

- Coupon input with a few demo coupons (e.g. JERSEY100 = flat Rs.100 off, FIT200 = flat Rs.200 off above Rs.2000). Show applied/invalid states and a remove option.

- "Place Order" leads to checkout.

7. CHECKOUT (stepper: Address, Payment, Confirm)

- Address is mandatory: select a saved address or add a new one (name, phone, pincode, house, city, state). Block progress without one.

- Payment options: UPI, Card, Net Banking, Cash on Delivery (mock forms with validation and a fake "processing" loader).

- On success: an animated success modal (confetti/check animation), then auto-redirect to My Orders after 3 seconds.

8. PROFILE PAGES

- My Address: add, edit, delete, set default.

- My Orders: order cards with order ID, date, items, total and a status timeline (Placed, Packed, Shipped, Out for Delivery, Delivered). Simulate status progression with timers or a demo "advance status" option. "Download Invoice" generates a PDF (jsPDF) with GST breakdown. After Delivered, show "Write a Review" (stars and text) and save it so it appears on the product page.

9. CONTACT PAGE

- Form (name, email, message) with validation and a success toast, plus map placeholder and details.

10. QUALITY REQUIREMENTS

- Clean component structure (components, pages, context/store, utils, data folders). Use Context or Zustand for auth/cart, with a localStorage helper wrapper.

- Reusable UI components (Button, Modal, Input, Card, Toast).

- Accessible (alt text, labels, focus states), SEO-friendly titles, lazy-loaded images, protected routes, 404 page.

- Deliver full working code with a folder structure, install/run steps, and comments where the localStorage logic would be swapped for real APIs later.
- add best attarctive premiumfont

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e3312530-4cd7-40d8-a9c5-fd4bf82f3390).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

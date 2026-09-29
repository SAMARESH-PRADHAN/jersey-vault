# Expand Jersey Fit collections and content pages

## Scope
- Expand the catalog from three print styles to eleven custom-team collections plus a separate ready-to-wear collection.
- Reuse only the four existing Jersey Fit images for collection cards, banners, products, and customer imagery.
- Preserve all current cart, checkout, authentication, coupon, order, review, and customization behavior.

## Implementation
1. **Catalog model and demo inventory**
   - Add the requested category slugs and an exclusive-ready-to-wear marker to the product model.
   - Centralize collection labels, banner imagery, and short descriptions so the navbar, home page, and shop banner stay consistent.
   - Add representative demo products for every new collection and ready-to-wear products.

2. **Navigation and home page**
   - Rename the category menu to “Custom Team Jersey,” expand it into a two-column desktop menu and mobile accordion, and add Top Wear, About Us, and Our Customers links.
   - Add the collection image grid immediately below the slider.
   - Add the four-step “How It Works” flow below the collection grid.

3. **Shop and product ordering rules**
   - Add a category-aware image banner to the shop page.
   - Add category and multi-select material filters while retaining price, sorting, loading, empty, and load-more states.
   - Mark ready-to-wear cards clearly; on their product pages remove customization controls and enforce 1–3 pieces total across all sizes.

4. **New and updated pages**
   - Add dedicated About Us and Our Customers pages with unique search/social metadata and the requested content.
   - Add the image banner, corrected working hours, and clickable WhatsApp quote action to Contact.

5. **Validation**
   - Check every new URL and navigation target, category switching, material filtering, and Top Wear quantity limits.
   - Verify desktop, tablet, and mobile layouts using the running preview and confirm the final build is clean.

## Technical details
- New routes: `/about` and `/customers`; all category navigation continues through typed `/shop?category=…` links.
- The category metadata will live with the catalog data and use imported bundled assets, avoiding duplicate hardcoded mappings.
- Top Wear quantities are constrained both when clicking steppers and when typing values, then revalidated before adding to cart.

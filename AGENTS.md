<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project architecture

- Keep category labels, banner images, descriptions, and catalog membership centralized in `src/data/products.ts` so navigation and collection pages cannot drift.
- Treat `top-wear` and `winter-top-wear` products as ready-to-wear inventory with no custom print options and a hard three-piece total limit.
- Keep `winter-top-wear` out of `/shop` results and its filter lists — Winter Top Wear sells only on its own page, following the premium-collection readymade pattern.
- `custom-premium` products are fully customizable (print types, logo, roster) with a stated MOQ of 5 pieces; they sell on `/premium-collection` and inside `/shop` filters. Never mix them with Top Wear / Winter Top Wear readymade rules.
- A cart containing any customizable product may pay 50% advance (balance settled from My Orders); a readymade-only cart is full payment only. Advance state lives on the Order (`payMode`, `amountPaid`, `balancePaid`).
- Keep Top Wear subcategory labels in the catalog and selection in validated shop search params so navigation and filters stay consistent.
- Mobile shop filters use a separate draft sheet and commit only on Apply so desktop sidebar interactions remain unchanged.

# BOUGE Soap — Project Context

Small-batch natural soap brand. Founder: Jill. Based in Kelowna, BC, Canada.

## Contact / Brand
- Instagram: @bougesoap
- Email: bougesoap.xyz@gmail.com
- Domain `bougesoap.xyz` (not `.com`) — not registered yet. The "Shop BOUGE"
  button in the welcome email intentionally links to `https://bougesoap.xyz`
  already; leave it as-is until the domain is live (don't "fix" it to the
  Vercel URL).

## Deployment
- Site: static HTML/CSS/JS, no framework, no build step (see README in
  `design_handoff_bouge_landing/` for original design brief).
- GitHub: `bouge-soap/bouge-site` — owned by a separate GitHub account
  (`bouge-soap`), NOT the personal `themiddejay` account also authenticated
  on this machine. Before pushing, check `gh auth status` — if `themiddejay`
  is active, run `gh auth switch --hostname github.com --user bouge-soap`
  first or the push will 403.
- Vercel: Team "Bouge-Soap" (separate from personal Vercel account), project
  `bouge-site`, imported from the GitHub repo above. Auto-deploys on push to
  `main`. Live at `bouge-site.vercel.app` until the custom domain is added.

## Klaviyo
- List: "BOUGE Launch List" — Public API Key `W6Yhh3`, List ID `YnmcN5`.
- Both signup forms on the site (hero + wholesale CTA) POST client-side to
  Klaviyo's v3 `client/subscriptions` API (see `scripts/main.js`) — NOT the
  deprecated v2 list-members endpoint that shows up in older docs/examples.
- Welcome email built as a standalone HTML file (table-based, email-client
  safe) at `~/Downloads/BOUGE Welcome Email.html`. Not yet wired to a live
  Klaviyo Flow — still needs: Flows → Create Flow → trigger "someone
  subscribes to BOUGE Launch List" → paste this HTML into the email block.
- Promo code `WELCOME20` in that email is a placeholder — owner will create
  the real discount code in Stripe when Stripe product setup happens (see
  below), so don't treat it as final/live yet.

## Pending: Stripe product links
The 3 product cards in `index.html` (`#soap` section — Charcoal, Rose Clay,
Ivory) each have a placeholder "Buy Now" button:
```html
<a class="product-card__buy" href="#" data-stripe-link="REPLACE_WITH_STRIPE_PAYMENT_LINK">Buy Now</a>
```
Owner will ask for help creating the actual Stripe Payment Links (and likely
the `WELCOME20`-equivalent discount code) — when that happens, update both
the `href` and `data-stripe-link` attribute on each card to the real Stripe
Payment Link URL.

## Founder section
`.founder__media` in `index.html` is still a placeholder (styled div, no
image) — swap for an `<img>`/`<video>` once Jill's photo/video is supplied.

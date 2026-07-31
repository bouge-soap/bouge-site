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
- List is actually named **"Website Contact Form"** in the account (not
  "BOUGE Launch List" as originally planned — owner kept the default name).
  Public API Key `W6Yhh3`, List ID `YnmcN5`.
- Both signup forms on the site (hero + wholesale CTA) POST client-side to
  Klaviyo's v3 `client/subscriptions` API (see `scripts/main.js`) — NOT the
  deprecated v2 list-members endpoint that shows up in older docs/examples.
  Payload does NOT include a `subscriptions` field on the profile — Klaviyo
  rejects that with a 400 ("not a valid field for the resource 'profile'").
  Calling this endpoint with the list relationship already is the subscribe
  action.
- The list's **opt-in was double opt-in by default**, which silently
  prevented any profile from being created via the API (Klaviyo's public
  endpoint always returns 202 regardless of what actually happens, so this
  was invisible from the request/response alone). Owner switched it to
  **single opt-in** in List Settings → Consent, confirmed working. If
  signups mysteriously stop working again, check this setting first.
- Welcome Flow "Welcome to Bouge Soap" exists, trigger = "Added to Website
  Contact Form list," status Live. Built from a standalone HTML file
  (table-based, email-client safe) at `~/Downloads/BOUGE Welcome Email.html`,
  pasted into the flow's email block.
- Promo code `WELCOME20` in that email is a placeholder — owner will create
  the real discount code in Stripe when Stripe product setup happens (see
  below), so don't treat it as final/live yet.
- Sender is `bouge.xyz@gmail.com` (a free Gmail address, not on the
  `bougesoap.xyz` domain) — sends currently land in spam. Real fix requires
  registering `bougesoap.xyz` and setting up domain authentication (SPF/DKIM)
  in Klaviyo Settings → Domains, then switching the sender to an address on
  that domain. Until then, expect deliverability problems on any real send.

## Compliance: avoid unsubstantiated "organic" claims
Per outside legal/marketing advice the owner received (ChatGPT-sourced, but
sound), avoid using "organic" as a standalone heading-level marketing claim
(hero label, values strip, etc.) since the products aren't certified organic
and that exposes the business to liability (Canada's Competition Act/CFIA
have real enforcement on unsubstantiated claims like this). It's fine to
name specific organic ingredients within an actual ingredient list (e.g.
"organic shea" in the Rose Clay product subtitle) since that's descriptive,
not a certification claim. Site copy was updated 2026-07-31 to replace
heading-level "Organic" with "Finest Sourced" / "the finest sourced
ingredients." Keep this distinction in mind for any future copy: ingredient
lists = ok to be specific, headlines/labels/taglines = stay soft.

## Planned: per-product ingredient dropdown
Owner wants each product card in the `#soap` grid to eventually have an
expandable ingredient list (full INCI-style ingredient list, not just the
short subtitle currently shown). Not built yet — waiting until products are
finalized. When this happens, it's a good place to be fully specific/accurate
about organic ingredients per the compliance note above, since a detailed
ingredient list is exactly the right context for that.

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

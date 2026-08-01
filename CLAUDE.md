# BOUGE Soap — Project Context

Small-batch natural soap brand. Founder: Jill. Based in Kelowna, BC, Canada.

## Status as of 2026-07-31 (end of session)
- Site is live at `bouge-site.vercel.app`, everything below is committed and
  pushed to `main` — nothing uncommitted left hanging.
- Signup forms (hero + wholesale CTA) are confirmed working end-to-end:
  submits → Klaviyo list → Welcome Flow. Verified live by owner.
- Known open issues, not code bugs, just real-world setup still pending:
  Klaviyo sender still an unauthenticated Gmail address (spam risk), Stripe
  product links are placeholders, founder photo/video not supplied yet.
- Owner said "new changes soon" when logging off — check in on what those
  are rather than assuming; nothing specific was queued at end of session.

## Contact / Brand
- Instagram: @bougesoap
- Email: bouge.xyz@gmail.com
- Domain `bouge.xyz` — registered at GoDaddy. Not yet pointed at Vercel or
  used for email; site is still on `bouge-site.vercel.app` and Klaviyo's
  sender is still a Gmail address. The "Shop BOUGE" button in the welcome
  email links to `https://bouge.xyz` already, correctly.

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
- Sender is `bouge.xyz@gmail.com` — note this is a **Gmail address** (domain
  is `gmail.com`, the "bouge.xyz" is just text in the username), NOT an
  address on the actual `bouge.xyz` domain. Real fix requires domain
  authentication (SPF/DKIM) in Klaviyo Settings → Domains, AND switching the
  sender to a real address on `bouge.xyz` (e.g. `hello@bouge.xyz`). Until
  both are done, expect deliverability problems on any real send.

### Email setup plan (in progress as of 2026-08-01)
Owner doesn't want to pay for email hosting yet, so the plan is:
1. Create a free Cloudflare account, add `bouge.xyz` to it
2. Update nameservers at GoDaddy to point to Cloudflare (domain stays
   registered at GoDaddy — only DNS management moves). Low risk to do now
   since nothing is live on this domain yet (site's still on the Vercel
   URL, no email currently flowing through it).
3. Set up Cloudflare Email Routing (free, unlimited forwarding addresses) —
   `hello@bouge.xyz` (or similar) forwards to the owner's existing Gmail.
   No new inbox to check, no cost.
4. Add Klaviyo's SPF/DKIM records in Cloudflare DNS, complete domain
   authentication in Klaviyo Settings → Domains
5. Switch Klaviyo's sender address to the real `@bouge.xyz` address

**Future migration to Google Workspace** (if/when owner wants a paid, real
mailbox instead of forwarding): easy, no lock-in. Cloudflare Email Routing
is pure forwarding, not mail storage, so there's nothing to migrate — just
swap Cloudflare's forwarding MX record for Google Workspace's MX record,
add Google's verification TXT + DKIM, done in ~10-15 min. One real gotcha:
**a domain can only have one SPF TXT record** — when Google gets added
later, its SPF include must be merged into the *same* record as Klaviyo's
(e.g. `v=spf1 include:_spf.google.com include:_spf.klaviyo.com ~all`), not
added as a second separate TXT record, or SPF breaks for both.

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

## Design system notes
- Design tokens (colors, fonts, spacing) live as CSS custom properties at
  the top of `styles/style.css` — match these exactly rather than
  hardcoding new values.
- Intentional brand language: sharp/architectural flat-color blocking
  between sections (no border-radius except pill buttons/inputs). Don't
  soften flat-color-to-flat-color seams (e.g. founder placeholder into its
  cream text panel) — that's deliberate, from the original hi-fi mockup.
- `.fade-edge` / `.fade-edge--top` / `.fade-edge--bottom` utility classes
  (added 2026-07-31) apply a soft gradient fade specifically where a
  full-bleed *photo* meets a flat-color section — currently used on the
  hero bottom, story image (both edges), and image-break section (both
  edges). This was a deliberate scope decision: photo edges get softened,
  flat-color seams stay sharp. Apply the same logic to any new full-bleed
  photo sections added later, rather than blending everything by default.
- `.reveal` class + `scripts/main.js` IntersectionObserver handles
  scroll-triggered fade/lift-in animation; hero has its own load-triggered
  entrance (`.hero__content.is-loaded`). Both respect
  `prefers-reduced-motion`. Keep new sections consistent with this instead
  of introducing a different animation approach.

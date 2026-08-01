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
- ✅ Sender is now `hello@bouge.xyz` (real domain address, set at the list
  level: Lists & Segments → "Website Contact Form" → Settings → Details →
  unchecked "Use account default"). Domain authentication is fully done —
  see the completed email setup plan below. No longer expect the old
  Gmail-sender spam problem; worth a real end-to-end test (submit the site
  form, confirm the welcome email lands in inbox, not spam) to be sure.

### Email setup plan (in progress as of 2026-08-01)
Owner doesn't want to pay for email hosting yet, so the plan is:
1. ✅ Create a free Cloudflare account, add `bouge.xyz` to it — done
2. ✅ Update nameservers at GoDaddy to point to Cloudflare (was
   `ns49`/`ns50.domaincontrol.com`, now `itzel.ns.cloudflare.com` +
   `vasilii.ns.cloudflare.com`) — done, propagated within minutes (confirmed
   via `dig @1.1.1.1`/`@8.8.8.8`). Domain stays registered at GoDaddy, only
   DNS management moved.
   - GoDaddy's default parked-domain DNS records (A records to a
     WebsiteBuilder placeholder, `www` CNAME, `_domainconnect` CNAME) were
     imported into Cloudflare as-is, untouched — not in use, harmless to
     leave. An existing `_dmarc` TXT record (`v=DMARC1; p=quarantine;
     adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;`) was also
     imported — kept, useful for the email authentication work below.
3. ✅ Cloudflare Email Routing set up and confirmed live (MX + SPF records
   verified via dig). Routing rule: `hello@bouge.xyz` → `bouge.xyz@gmail.com`
   (Active). Catch-all rule exists but was still set to Drop/Disabled as of
   this session — worth checking/enabling it (send to same Gmail) so nothing
   addressed to the domain silently bounces.
4. ✅ Klaviyo domain auth complete: used Klaviyo's "branded sending domain"
   flow with subdomain prefix `send` (creates `send.bouge.xyz`, fully
   delegated to Klaviyo's nameservers via 4 NS records — Klaviyo manages
   that subdomain's DKIM/etc entirely on their own side, no ongoing
   SPF-merge concern for it). Also added a one-time root-domain TXT record
   `klaviyo-site-verification=W6Yhh3` (coexists fine with the existing SPF
   TXT record — different record purpose, not a conflict). Verified by
   Klaviyo within minutes, then **Activated** in Settings → Domains —
   `send.bouge.xyz` shows Domain Status: Active.
5. ✅ Sender switched from `bouge.xyz@gmail.com` to `hello@bouge.xyz` at the
   list level (Lists & Segments → "Website Contact Form" → Settings →
   Details → unchecked "Use account default", entered sender name "BOUGE" +
   email `hello@bouge.xyz`). Saved and confirmed.

**Status: this whole plan is now done.** Worth one real end-to-end test
(submit a signup on the live site, confirm the welcome email actually lands
in an inbox instead of spam) to fully close the loop, but all the
infrastructure work is complete.

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
The photo/video column (`.founder__media`) was **removed entirely** (not
just hidden) as of 2026-08-01, since the site went live before Jill's
portrait was ready and a visible dev-placeholder wasn't acceptable to ship.
`.founder` is now a single centered text column (`.founder__text`,
max-width 640px) instead of a 2-column grid. To bring the photo back later:
re-add a `.founder__media` block before `.founder__text` in `index.html`
and restore the 2-column grid + media styles from git history (see the
commit that removed this, or `--color-founder-placeholder` token still
defined in `style.css` for reference) — don't just re-add a placeholder div
again, wait until there's a real image/video to use.

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

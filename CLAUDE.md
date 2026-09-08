# BOUGE Soap — Project Context

Small-batch natural soap brand. Founder: Jill. Based in Kelowna, BC, Canada.

## Status as of 2026-09-07 (in progress)
- **Shipping-cost transparency fix — done, local only, not yet pushed.** Jill flagged that buyers landing on a single-bar checkout just see a flat $25 total with no visible breakdown of $16 + $9 shipping. Root cause: Stripe Checkout *does* itemize Subtotal/Shipping/Total on every Payment Link, but (a) mobile collapses that breakdown behind a "Show order summary" toggle (fixed Stripe behavior, not configurable), and (b) the site itself never mentioned shipping before the click-through. Fix: added a small muted `.product-card__shipping-note` / `.latest-batch__shipping-note` line under the price on every card (AZURE, LAVANDE, Eclipse, BOUGE Box in both the full grid and the "Latest batch" teaser), reading e.g. "+ $9 shipping (Canada)". BOUGE Box's note swaps between "+ $12 shipping (Canada)" (box of 3) and "+ $14 shipping (Canada)" (box of 6) via the existing `bougeBoxSize` select JS (`data-shipping` attribute added alongside the existing `data-price`), same pattern as the price swap. Verified visually in a local server + browser check, and confirmed the box-size swap correctly updates price/shipping-note/both button hrefs via direct DOM test. Not yet committed/pushed.
- **Local pickup links — Stripe side done, site wired up, local only, not yet pushed.** Jill wants a second "pick up in Kelowna" purchase path per product: no shipping charge, a required confirmation that no delivery is available, a distinct thank-you/confirmation flow that doesn't mention shipping, and a separate alert email to Josh + Jill (not the standard sale alert) so she can arrange pickup logistics with the buyer.
  - **Restricted key scope bumped 2026-09-07** — owner added "Payment Links: Write" to `~/.stripe/bouge.key` in the Dashboard (was previously Products/Prices/Files write only). Verified working via a live `GET /v1/payment_links` call before creating anything.
  - **5 live pickup Payment Links created via API**, one per product, each reusing the *existing* Price ID (no new Products/Prices) with no shipping rate and no shipping-address collection attached, `consent_collection.terms_of_service = required` with custom message "I understand this order is for local pickup in Kelowna, BC only. No shipping or delivery is available for this option, and I will be contacted to arrange a pickup time and location.", `phone_number_collection.enabled = true` (so Jill/Josh have a number to reach the buyer), `payment_intent_data.metadata = {fulfillment: "pickup", site_slot: "<slug>"}`, and `after_completion` redirecting to `https://bouge.xyz/thankyou-pickup.html`. Stock caps mirror the existing shipping-link caps per owner's 2026-09-07 decision (see stock note below): AZURE/LAVANDE/Eclipse = 30, Box-of-3 = 20, Box-of-6 = 10.
    - AZURE → `plink_1UDDe8K5HjcCzJ5Ghm4o7xeC` — `https://buy.stripe.com/14AfZi8QMbPQ9flfAm1RC0b`
    - LAVANDE → `plink_1UDDeFK5HjcCzJ5GkbHdS9OH` — `https://buy.stripe.com/dRm5kEd728DE9fl1Jw1RC0c`
    - Eclipse → `plink_1UDDeMK5HjcCzJ5GUqyGbpjG` — `https://buy.stripe.com/7sYfZi6IE7zA2QXfAm1RC0d`
    - Box of 3 → `plink_1UDDeVK5HjcCzJ5GwTc5MqQ1` — `https://buy.stripe.com/6oU7sMaYU8DEgHN73Q1RC0e`
    - Box of 6 → `plink_1UDDeyK5HjcCzJ5GK9HBIZWB` — `https://buy.stripe.com/14AcN6aYU9HIbntfAm1RC0f`
  - **Verified via `GET` on the AZURE link** that `shipping_address_collection` is `null` and `shipping_options` is `[]` — confirms the buyer-facing receipt won't reference shipping, since Stripe only adds that line when a session actually collects it. Not yet confirmed with a live test purchase (see "Next steps" below) — the field-level check is strong evidence but not the same as watching a real receipt land.
  - **New pickup-specific thank-you page**: `thankyou-pickup.html` (copied from `thankyou.html`, same styling/nav/footer, copy changed to "Your BOUGE pickup order is confirmed. We'll be in touch by email shortly to arrange a pickup location and time in Kelowna." — no shipping language, no shipping ETA claim).
  - **Site wired up locally** — every product card in the `#soap` grid (AZURE, LAVANDE, Eclipse, BOUGE Box) now has a `.product-card__actions` row with both "Buy Now" (existing ship link) and a new outline-style "Pick Up in Kelowna" button (new pickup link), plus a small note underneath: "Pickup option: Kelowna, BC only — no delivery." BOUGE Box's pickup button swaps with the box-size `<select>` via a new `data-pickup` attribute on each `<option>`, same pattern as the existing price/shipping swap — verified working via direct DOM test (switching to Box of 6 correctly updated all four: price, shipping note, ship-link href, pickup-link href). Pickup buttons were deliberately NOT added to the lightweight "Latest batch" hero teaser, to keep that section simple — full ship-vs-pickup choice lives in the main `#soap` catalog only.
  - **Not yet done — owner-notification differentiation.** Plan: since each pickup PaymentIntent now carries `metadata.fulfillment = "pickup"`, add an if/else branch to the existing sale-alert Stripe Workflow so pickup orders get differently-worded copy ("PICKUP ORDER — contact buyer to arrange location/time") while shipping orders keep the current email unchanged. **This has to be done manually in the Dashboard** — Stripe Workflows' visual builder has no public authoring API (only a "trigger programmatically" API for invoking an existing workflow, not for defining one), so this can't be scripted the way the Payment Links were.
  - **Stock cap decision (owner confirmed 2026-09-07): do NOT split existing ship-link caps.** Existing caps (30/30/30 bars, 20 box-of-3, 10 box-of-6) stay as-is; pickup links were added on top with matching caps of their own. Known consequence, accepted for now: since each Payment Link's `restrictions.completed_sessions.limit` only counts sales on that specific link, combined ship+pickup sales for a given soap could exceed real physical stock — nothing enforces a shared pool across two links. Will need manual watching/adjustment of caps as orders land on both links per product until/unless revisited.
  - **Pushed live 2026-09-07** — commit `9d4346d`, verified via curl: `bouge.xyz` shows "Boxed Sets" / "For shipping across Canada" / "Pick Up in Kelowna", and `bouge.xyz/thankyou-pickup.html` returns 200.
  - **Still outstanding**: (1) a $0.50-style live test pickup purchase (same method as the original shipping test link) hasn't been done yet — worth doing to confirm the ToS checkbox blocks payment, no shipping ever appears, and the receipt reads correctly, since real pickup Payment Links are now reachable from the live site; (2) the sale-alert Workflow branch (see below) is built but **still sitting as Draft** — owner needs to click Publish in the Stripe Dashboard for pickup orders to actually route to the distinct alert email; until published, pickup orders will just hit the default/else path (the normal existing email) with no pickup-specific flag.
- **Sale-alert Workflow branch — built 2026-09-07, screenshot-driven with owner in the Dashboard, still unpublished (Draft).** Existing "BOUGE SOAP SALE" workflow (trigger: Payment intent succeeded → action: Email team member, recipients Jill + Josh) now has a Condition step inserted right after the trigger: `Payment intent | Metadata | fulfillment is equal to pickup`. True branch → new "Email team member" action (To: Jill + Josh, body includes `Payment intent | Receipt email`, `Payment intent | Payment details | Order reference`, `Payment intent | Customer ID`, with "Amount" and `Metadata[site_slot]` recommended as further additions to identify order value/product at a glance). False branch → the original pre-existing email action, untouched, so normal shipping-order alerts are unaffected. Caught and fixed a key-name typo mid-build ("fullfillment" vs the real metadata key "fulfillment") before it could silently break pickup routing. **Note**: the buyer's phone number (collected via `phone_number_collection` on the pickup links) is NOT available to insert into this email — it lives on the Checkout Session object, not the Payment Intent, and this workflow's trigger only exposes Payment Intent fields. Phone number is still visible by opening the actual payment in the Stripe Dashboard, just not automatable into this alert without switching the trigger type (not done, deemed not worth restructuring for). **Must click Publish in the workflow editor before this branch actually takes effect** — still sitting as Draft as of this entry.
- **Box product renamed to "Boxed Sets" 2026-09-07** — Jill sent new copy (via a ChatGPT screenshot exploring several naming options: "Boxed Sets" vs "6-Bar Box" vs "BOUGE Boxed Set"), confirmed final choice = **"Boxed Sets"**, with only the first description line adopted for now ("Boxed sets arrive beautifully presented in BOUGE packaging, ready to give — or keep.") — a second proposed line ("Gift-box presentation available upon request.") was explicitly deferred, not added anywhere. Pricing unchanged ($45/$85), so no Price or Payment Link recreation needed at all — pure name/copy change:
  - Site (local, not pushed): `product-card__name` and `latest-batch__name` both changed "BOUGE Box" → "Boxed Sets"; box card subtitle replaced with the new single line (old "curated set... choose a box of three or six" copy removed).
  - **Latest batch teaser also got pickup buttons 2026-09-07** — owner caught that AZURE/LAVANDE in the "Latest batch" hero teaser still only had a direct "Buy Now" (shipping) link with no pickup alternative, unlike the full `#soap` grid below. Added matching `.latest-batch__actions` wrapper with a "Pick Up in Kelowna" outline button + "Pickup: Kelowna, BC only — no delivery." note to both cards, same link targets as the full grid's pickup links. Boxed Sets' teaser card was deliberately left alone — it already routes to "Choose Size" → `#soap` rather than a direct checkout link, so there's no risk of a customer landing on a shipping-only checkout from there.
  - **Per-button captions 2026-09-07** — owner asked to pair each caption directly under its own button rather than one shared line below both. Restructured both the teaser (`.latest-batch__actions` → `.latest-batch__action-col` per button) and the full grid (`.product-card__actions` → `.product-card__action-col` per button) so "For shipping across Canada" sits under Buy Now and "Pickup: Kelowna, BC only — no delivery." sits under Pick Up in Kelowna, side by side, on all four full-grid cards and both applicable teaser cards. Verified via browser after a stale-cache false alarm (file was correct, browser just hadn't hard-reloaded).
  - Stripe (live, pushed immediately since it's just Product metadata, not pricing): both `prod_VADGIPI4c7IZcT` (Box of 3) and `prod_VADGBprwcVySF1` (Box of 6) had `name` updated to "Boxed Sets — Box of 3" / "— Box of 6" and `description` updated to the new copy line + the existing size-specific curated-bars sentence (kept intentionally, since splitting these into two Products on 2026-08-29 specifically fixed a bug where both checkout pages showed identical generic copy — didn't want to reintroduce that ambiguity). Since the pickup Payment Links reuse these same two Products, both shipping and pickup checkout pages for the box now show the new branding automatically — no separate update needed. Owner flagged more copy changes may still be coming.

## Status as of 2026-08-28 (end of session)
- **Product photos are in.** 5 shots from `/Volumes/T7/LightroonmExports/2026-Aug-28-BOUGE-SOAP-IndividualProductSoaps/Product Selects/`. First 3 (DSC07933, DSC07928, DSC07939) are the staple soaps — center-cropped to square and saved as `assets/images/product-staple-1.jpg` / `-2.jpg` / `-3.jpg`. 5th (DSC07999, box of 6) is the bulk box shot, kept at its natural wide crop (forcing it square clips the right column of soaps) — saved as `assets/images/product-bulk-box.jpg`. 4th (DSC07955, ivory bar) — **now assigned**: this is LAVANDE, see below.
- **Product grid section (`#soap`) is un-hidden and built out locally** — `section-hidden` and `coming-soon` classes removed from `index.html`/`style.css` (dead CSS for the old grayscale teaser + hover overlay was deleted too, since real photos replaced that state). Nav "Soap" link restored. **Not pushed live yet** — confirm with owner before pushing, since Stripe isn't wired up.
- Card content: 3 staple cards use `[Name TBD]` / `[Description / ingredients TBD]` placeholders — owner doesn't have real names/descriptions/prices from Jill yet. 4th card is the bulk box, named "BOUGE Box" (confirmed), with a **working** `<select>` for Box of 3 / Box of 6 (not wired to anything yet, just UI). All 4 buy buttons are non-clickable `<span class="product-card__buy product-card__buy--disabled">` pills reading "Coming Soon" — swap to a real `<a href>` once a real checkout mechanism exists (see below).
- **⚠️ Stripe account CORRECTION**: the Claude Stripe MCP connector (`mcp__stripe__*` tools) is stuck pointed at `acct_1SUaBIGnQiTNdOBO` — this is Josh's **personal/joshwoodman.com account** (has 33+ unrelated pre-existing products), NOT Bouge's. Reconnecting the connector via Claude Settings → Connectors did NOT actually change which account it authorizes against, despite appearing to during setup — don't trust it without independently re-verifying (see below). **Do not use the `mcp__stripe__*` tools for BOUGE work until this is fixed.**
  - On 2026-08-28 four placeholder Products + prices were mistakenly created in that wrong account. They were archived (`active: false`) and scrubbed (renamed to "[deleted - created in error, ignore]", metadata cleared) since Stripe has no way to fully delete a Product/Price via this API surface — Prices can never be deleted, only archived, by Stripe's design. Owner may be able to hard-delete via the dashboard "···" menu (works for products with zero real orders) — unconfirmed whether that succeeded.
  - **Real BOUGE Soap account is `acct_1U9EP7K5HjcCzJ5G`.** Working access method: a Stripe **restricted API key** (Products: Write, Prices: Write only — created via Stripe's "Authorizing an AI agent" key-creation flow), saved locally at `~/.stripe/bouge.key` (chmod 600, never pasted into chat/conversation). Used via raw `curl -u "$(cat ~/.stripe/bouge.key):"` calls in Bash, bypassing the broken MCP connector entirely.
  - **Verification method that actually works** (the dashboard-link approach failed to catch the wrong-account issue because it was circular — built from the same ID being verified): call `GET /v1/account` with the key; even on a permission-denied error, Stripe's error message discloses the true `account_id` in plaintext — compare that against the known-bad ID. Also list products (`GET /v1/products`) and check for pre-existing unrelated items as a red flag before creating anything.
- **Stripe Products — live in the CORRECT account (`acct_1U9EP7K5HjcCzJ5G`)**, via restricted key + curl (the MCP connector is still stuck on the wrong account — see above, unresolved). All 4 Products are now `active: true` (required for Payment Links to work) even though names are still `[Name TBD]` on the 3 staples — this is fine, checkout pages will show the placeholder text until updated, see below for why that's low-risk. `metadata.site_slot` maps each back to its card:
  - Staple 1 → `prod_V9n229ZfYBki8R`
  - Staple 2 → `prod_V9n2cRv9o3yQ58`
  - Staple 3 → `prod_V9n2edhcdlKQwt`
  - BOUGE Box → `prod_V9n2iGKm0hr7Kh` (name already real, "BOUGE Box")
  - **Product images attached 2026-08-28** — uploaded directly to Stripe's Files API (`files.stripe.com`, purpose `product_image`) and linked via `file_link`, so they don't depend on the site being live. Restricted key needed `Files: Write` added for this.
  - When Jill's real names/descriptions land: update `name`/`description` on each Product via API (mutable) — Payment Links pull these live, no recreation needed.
- **Real, final pricing set 2026-08-28** (confirmed by owner, not placeholder): bars $16 CAD each, Box of 3 $45 CAD, Box of 6 $85 CAD. (An earlier placeholder round at $18/$52/$100 was created then archived same day — old Price IDs no longer relevant, not listed here.)
  - Staple 1 price: `price_1U9U8OK5HjcCzJ5GHfwkX7mI` — Staple 2: `price_1U9U8PK5HjcCzJ5GFCEz2BkC` — Staple 3: `price_1U9U8PK5HjcCzJ5Gs84OmbPw` (all $16.00 CAD)
  - BOUGE Box: `price_1U9U8PK5HjcCzJ5GNKn92gxr` = Box of 3 ($45 CAD, lookup key `bouge_box_3_v2`), `price_1U9U8PK5HjcCzJ5GwC3NhppX` = Box of 6 ($85 CAD, lookup key `bouge_box_6_v2`)
- **Shipping Rates created** (Canada only — no international yet), rough placeholders from a Canada Post/courier rate table, revisit if actual costs differ: `shr_1U9U8vK5HjcCzJ5GEStYie7R` = $7 CAD (single bar), `shr_1U9U8wK5HjcCzJ5G1t4p26L3` = $9 CAD (box of 3), `shr_1U9U8wK5HjcCzJ5GptMHuic4` = $12 CAD (box of 6). Known limitation: Payment Links charge this flat regardless of quantity — if adjustable quantity is ever turned on for a bar link, multi-unit orders would undercharge shipping. Bar links currently lock quantity to 1 specifically to avoid this.
- **Checkout mechanism: Payment Links** (confirmed via Stripe's own implementation-planner tool — correct choice for a zero-backend static site). **6 live Payment Links**, each requiring a Canadian shipping address, correct Shipping Rate attached, redirecting to `https://bouge.xyz/thankyou.html` after purchase. **Stock caps set 2026-08-28**: 30 each on the 4 individual bars, 20 on Box of 3, 10 on Box of 6 (via `restrictions.completed_sessions.limit`, editable anytime, no recreation needed):
  - Staple 1 → `plink_1U9UARK5HjcCzJ5GqmjWbOFl` — `https://buy.stripe.com/bJefZiaYU8DE639gEq1RC00`
  - Staple 2 → `plink_1U9UASK5HjcCzJ5GnAa61WNi` — `https://buy.stripe.com/bJeaEY9UQ6vw639bk61RC01`
  - Staple 3 → `plink_1U9UASK5HjcCzJ5Gug557und` — `https://buy.stripe.com/eVq8wQ7MIg668bh3RE1RC02`
  - LAVANDE → `plink_1U9Vn3K5HjcCzJ5GDnPIWXir` — `https://buy.stripe.com/8x27sM8QM6vwezFdse1RC07`
  - Box of 3 → `plink_1U9UATK5HjcCzJ5G651vwBtG` — `https://buy.stripe.com/00w8wQc2Y5rsajpdse1RC03`
  - Box of 6 → `plink_1U9UATK5HjcCzJ5GiC61Onwq` — `https://buy.stripe.com/00wcN68QM1bcajp73Q1RC04`
  - **Now linked from the site locally** — buttons in `index.html` are real `<a href>` Payment Links (no longer disabled spans), including in the "Latest batch" hero teaser. Still uncommitted/not pushed.
  - **Test Payment Link** (for verifying the full flow — money, both notification emails, thank-you redirect): `plink_1U9UwNK5HjcCzJ5GaPpeU1XZ` — `https://buy.stripe.com/5kQaEYgjebPQbnt0Fs1RC06`, product `prod_V9oFQmMItZFCPQ`, $0.50 CAD, no shipping fee (removed on request), Canadian address still required, 5-purchase cap. An earlier $1 + $7-shipping version of this test link exists but is deactivated — don't use it.
- **BOUGE Box split into two separate Products 2026-08-29** — owner caught that the box-of-3 and box-of-6 Payment Links shared one Product (`prod_V9n2iGKm0hr7Kh`, now archived), so both checkout pages showed the same generic "Choose a box of three or six" description even after the buyer had already picked a size. Stripe shows Product name+description per Payment Link, not something that varies per Price within a shared Product, so the fix was two distinct Products, each with a description naming its own size:
  - Box of 3 → `prod_VADGIPI4c7IZcT`, price `price_1U9sqIK5HjcCzJ5GaxdSLJjO` ($45 CAD), link `plink_1U9sqJK5HjcCzJ5GPBS0zZVC` — `https://buy.stripe.com/3cIdRaaYUaLM0IPag21RC09`
  - Box of 6 → `prod_VADGBprwcVySF1`, price `price_1U9sqIK5HjcCzJ5GA0puJaSR` ($85 CAD), link `plink_1U9sqJK5HjcCzJ5GySkWDgXS` — `https://buy.stripe.com/bJedRa4AwbPQ77dewi1RC0a`
  - Same shipping rates/stock caps carried over (Box of 3: $12 CAD shipping, 20 cap. Box of 6: $14 CAD shipping, 10 cap). Site's box-size `<select>` updated to point at these new links. Old shared-Product links deactivated, not deleted.
- **Shipping rates bumped 2026-08-29** (owner's revised numbers, sanity-checked against the Canada Post/courier table and confirmed reasonable): bar $7→**$9 CAD**, box-of-3 $9→**$12 CAD**, box-of-6 $12→**$14 CAD**. New Shipping Rate objects: `shr_1U9sc9K5HjcCzJ5G3dV5tumQ` (bar), `shr_1U9sc9K5HjcCzJ5GLqAjzXdN` (box-of-3), `shr_1U9scAK5HjcCzJ5GuUBWGJOh` (box-of-6) — old ones archived, all 5 live Payment Links (AZURE/LAVANDE/Eclipse/Box-of-3/Box-of-6) repointed to the new rates. Test link's shipping was intentionally removed earlier, untouched by this change.
- **Ingredients standardized 2026-08-29**: "castor" → "castor oil" across AZURE, LAVANDE, and Eclipse (site cards + Stripe `description`/`metadata.ingredients` on all three). AZURE ingredients added for the first time: "Organic olive, coconut, castor oil & shea butter, Cambrian blue clay."
- **Lineup finalized 2026-08-29: AZURE, LAVANDE, Eclipse + BOUGE Box only.** Owner confirmed only 3 individual soaps are launching for now:
  - Old "Staple 1" (DSC07933, peach/grey wave) **renamed to AZURE** — real name + description from Jill: "Raspberry-Lime heaven. Fresh Raspberry & Lime meet cool mint-bright clean and beautifully unexpected." Same Product/Price/Payment Link IDs as before (`prod_V9n229ZfYBki8R`, `price_1U9U8OK5HjcCzJ5GHfwkX7mI`, `plink_1U9UARK5HjcCzJ5GqmjWbOFl` — `https://buy.stripe.com/bJefZiaYU8DE639gEq1RC00`), just updated name/description — no recreation needed. Image copied to `assets/images/product-azure.jpg` (old `product-staple-1.jpg` left in place, unused).
  - Old "Staple 2" (DSC07928, charcoal+gold+salt) and "Staple 3" (DSC07939, dark+cream swirl) — **archived, not deleted**, owner said "not going to be used yet," may revisit later. Product/Price/Payment Link all set `active: false` for both (`prod_V9n2cRv9o3yQ58` / `prod_V9n2edhcdlKQwt` and their Prices/Links) with `metadata.status` noting why. Removed entirely from the site (both the full `#soap` grid and had never been in the teaser). If they come back later, just flip `active: true` on all three objects per soap — no need to recreate.
  - Full grid is now 4 cards: AZURE, LAVANDE, Eclipse, BOUGE Box (box naturally sits alone in row 2 at 3-col width — not full-width silo like before, just a short trailing row, that's fine/expected for a 4-item catalog).
- **Eclipse — full 6th soap added 2026-08-28.** New photo (DSC07968, dark charcoal bar with gold detail — not one of the original 5 shots, owner sent it separately), cropped same as the others → `assets/images/product-eclipse.jpg`. Real name + description from Jill: "Dark, seductive and unexpectedly fresh. Wild berries and bright lime open into soft vanilla, settling into a smooth white musk. Rich and slightly mysterious, with just enough sweetness to draw you back in." (site card shows a shortened version, full text is on the Stripe Product). Also got a real **ingredients list** for the first time — "Organic olive, coconut, castor & shea butter, activated charcoal" — stored in `metadata.ingredients` on the Stripe Product since the site has nowhere to display it yet (see "Planned: per-product ingredient dropdown" below — not built). Same $16 CAD / 30-unit-cap / $7-shipping pattern as the other bars. Product `prod_V9piUTXoFcQfGy`, price `price_1U9W3CK5HjcCzJ5GxungILvd`, Payment Link `plink_1U9W3EK5HjcCzJ5GgQ5omvHY` — `https://buy.stripe.com/8x2dRa6IEf224Z5bk61RC08`. Added to the full `#soap` grid only, not swapped into the "Latest batch" teaser (that's staying at 3 items by design).
- **LAVANDE — full 4th soap added 2026-08-28.** Real name + description from Jill (not a placeholder): "French lavender softened with violet and jasmine, brightened by citrus and grounded in warm amber, musk and woods." Assumed $16 CAD pricing and 30-unit stock cap to match the other bars — flag if either should differ. Product `prod_V9pRk4dvxP08rv`, price `price_1U9Vn1K5HjcCzJ5Gjqpfu10p`, image `assets/images/product-lavande.jpg` (cropped from DSC07955, same treatment as the other staples). Added to both the full `#soap` grid and swapped into the "Latest batch" hero teaser (replacing one of the `[Name TBD]` cards, since LAVANDE has real branding).
- **BOUGE Box card un-siloed 2026-08-28** — removed the `grid-column: 1/-1` full-width override and the 3:2 aspect override on `.product-card--bulk`, so it now sits in the normal 3-col grid flow alongside whichever soaps land in the same row (currently LAVANDE + Eclipse), instead of getting its own full-width row. Since the box photo is a wide landscape crop and forcing it to the same square slot via `object-fit: cover` would crop off soaps at the edges (tried this originally, that's why it was full-width to begin with), it now uses `object-fit: contain` with a background fill instead — shows the entire box photo un-cropped, letterboxed within the square card slot.
- **Founder section copy replaced 2026-08-28** — Jill sent final "I'm Jill." story copy (kept heading, subtitle, and pull quote exactly; six new short paragraphs replaced the old two-paragraph placeholder body). Layout/classes unchanged, `founder__paragraph` reused as-is.
- **Hero now has a "Shop Soaps" CTA** — amber pill button, Josefin Sans (matches the nav wordmark), anchors to `#soap`, placed above the mailing-list signup form so purchase intent leads. Added per owner's explicit ask to make it "clearly obvious soaps are available" from first landing.
- **New "Latest batch" section added right after the hero** — a 3-up teaser (2 soaps + the box) with direct one-click buy, "View all soaps" linking to the full `#soap` grid. Deliberately NOT a reorder of the full grid (would've front-loaded a heavy commerce block before any brand story, working against the site's quieter tone) — a lightweight teaser instead, full catalog still further down. Uses its own `.latest-batch*` CSS classes, self-contained.
- **Stripe account public-facing identity fixed 2026-08-28** — Public business name set to "BOUGE Soap" (was showing legal entity "Inside Digital Corp" to customers before). Statement descriptor set to "BOUGE". Support phone number needed removing/toggling off — it was accidentally set to a family member's personal number and showing on customer receipts; fixed via Settings → Business details → Public details → Edit.
- **Post-purchase thank-you page — LIVE**, pushed 2026-08-28 as a standalone commit (only `thankyou.html`, none of the other WIP homepage changes — those are still local-only). Live at **`https://bouge.xyz/thankyou.html`** — note the `.html` is required, `/thankyou` (no extension) 404s since there's no `vercel.json` with clean URLs configured. All 5 Payment Links' `after_completion.redirect.url` point to the `.html` version.
- **Notifications — all confirmed working**:
  - Seller "email me on sale": Stripe Dashboard → Settings → Personal details → Communication preferences → on, for Josh's account.
  - Customer automatic receipt email: Settings → Emails → Payments → "Successful payments" → on. Confirmed this isn't overridden by any `receipt_email` API param (none of the Payment Links set one).
  - Team alert via Stripe Workflows: trigger "Payment intent succeeded" → sends to Josh + jesse@jessedylan.com currently. `bouge.xyz@gmail.com` not yet added (owner will add later, needs to be set up as a Stripe Team Member or added to the Workflow's "Send team email" recipients first).
- Next steps in order: (1) Jill provides staple names/descriptions, (2) update the 3 Products' name/description via API, (3) get real inventory counts and set redemption limits on each Payment Link, (4) swap the disabled "Coming Soon" buttons for real `<a href>` Payment Link URLs, (5) commit + push the full homepage WIP changes, (6) fix/abandon the still-broken MCP connector question, (7) add `bouge.xyz@gmail.com` to the sale-alert Workflow.

## Status as of 2026-08-01 (end of session)
- **Site is live at the real domain: `https://bouge.xyz`** (not just the
  Vercel URL anymore — domain connected, DNS + SSL confirmed working,
  valid Let's Encrypt cert). `bouge-site.vercel.app` still works too and
  will keep working indefinitely (Vercel doesn't kill it once a custom
  domain is added), but treat `bouge.xyz` as canonical going forward.
- Everything is committed and pushed to `main` — nothing uncommitted left
  hanging.
- Email is fully working: signup forms → Klaviyo list → Welcome Flow →
  authenticated `hello@bouge.xyz` sender (no more Gmail spam-risk sender).
  Domain auth (SPF/DKIM), Cloudflare Email Routing, and Klaviyo's branded
  sending domain are all done — see the Klaviyo section below for details
  if any of this needs revisiting.
- **Product section is hidden entirely** (`section-hidden` class) — owner
  decided not to even tease "coming soon" for now. Nav's "Soap" link is
  also removed to match. See "Pending: Stripe product links" section below
  for exactly how to bring it back.
- **No discount/promo code anywhere** (site or welcome email) — this was
  deliberately removed 2026-08-01 per Jill's decision. Don't reintroduce
  without being asked again.
- Today's session was mostly rapid small copy tweaks directly from Jill's
  feedback (relayed by the owner) — expect more of these. Pattern so far:
  owner describes what Jill wants changed, I locate + edit + confirm
  diff, owner says push, I push and verify live via curl. Keep that loop
  tight and fast rather than over-explaining each change.
- Founder photo/video still not supplied — founder section stays
  text-only until then (see "Founder section" below, do NOT re-add a
  placeholder div, wait for the real asset).

## Contact / Brand
- Instagram: @bougesoap
- Email: `hello@bouge.xyz` (forwards to `bouge.xyz@gmail.com` via Cloudflare
  Email Routing — see Klaviyo section below for full setup)
- Domain `bouge.xyz` — registered at GoDaddy, DNS managed at Cloudflare.
  **Not yet pointed at Vercel** — the domain itself doesn't load the site;
  live site is still only at `bouge-site.vercel.app`. Because of this, the
  "Shop BOUGE" button in the welcome email (`~/Downloads/BOUGE Welcome
  Email.html`) was deliberately changed 2026-08-01 to link to
  `https://bouge-site.vercel.app` instead of `https://bouge.xyz`, so it
  actually works for anyone who clicks it right now. **Once the domain is
  connected to Vercel, switch this link back to `https://bouge.xyz`** — and
  remember: editing that local HTML file does NOT update Klaviyo, the
  updated HTML has to be re-pasted into the Flow's email block in Klaviyo's
  editor for changes to take effect on real sends.

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
- ⚠️ **No discount offer** — Jill decided against the 20%-off-first-order
  idea entirely (2026-08-01). The `WELCOME20` promo code section was
  removed from `~/Downloads/BOUGE Welcome Email.html` and replaced with a
  "we'll be in touch when the next batch is ready" message + a "Visit
  BOUGE" button (no code, no discount). Site copy (signup form notes) was
  changed the same way: "Join the mailing list for updates on our next
  batch." **Don't reintroduce discount/promo-code language** anywhere
  (site or email) unless explicitly asked again.
  - The updated welcome email HTML was edited locally but still needs to be
    **re-pasted into Klaviyo's flow editor** to actually take effect on
    real sends (editing the local file alone does nothing to Klaviyo).
  - Klaviyo's **Preview text** field (typed manually in the flow's sidebar,
    separate from the HTML) likely still references the old 20% copy —
    needs updating too.
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

## Pending: Stripe product links + product photos
As of 2026-08-01, the entire product grid section (`#soap` — Charcoal, Rose
Clay, Ivory cards) is **hidden entirely** via a `section-hidden` class on
`<div class="products coming-soon section-hidden" id="soap">` in
`index.html` (`.section-hidden { display: none; }` in `style.css`). Owner
decided to hide the whole section rather than show the "coming soon"
teaser state, until there's an actual product to launch. The "Soap" nav
link was also removed (commented out) from the nav, since it pointed at
this now-hidden section.

The section still has its "coming soon" markup/styling underneath (grey
photos, badges, disabled buttons — see below) — that's independent of the
`section-hidden` visibility toggle and doesn't need to be touched to bring
the section back.

**To bring the section back** (once ready to at least tease the products,
even before Stripe links are real):
1. Remove `section-hidden` from the `.products` div
2. Re-add the "Soap" nav link in the `<nav>` at the top of `index.html`
   (currently commented out with a note pointing here)
3. Decide whether it should still show as "coming soon" (see below) or go
   straight to fully live

**To fully launch purchasing** (once real photos are ready and Stripe
Payment Links exist), in addition to the above:
1. Also remove the `coming-soon` class from that `.products` div — this
   restores full-color photos, hover effects, and hides the "Coming Soon"
   badges (all scoped via CSS under `.products.coming-soon`, see
   `styles/style.css`)
2. Swap each `<span class="product-card__buy" data-stripe-link="...">Coming Soon</span>` back to `<a class="product-card__buy" href="STRIPE_LINK_HERE">Buy Now</a>` with the real Stripe Payment Link URL
3. Replace the product images in `assets/images/` with final photos if the
   current ones aren't the ones to launch with

Note: no discount/promo code is planned (see Klaviyo section above — the
WELCOME20 idea was scrapped 2026-08-01), so nothing discount-related needs
setting up in Stripe either.

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

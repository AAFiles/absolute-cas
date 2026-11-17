# Public route: absolute-academy.com/calculator

Status checked 2026-11-17. Nothing in this document has been applied to the live site, DNS or the core calculator.

## What was verified

- **Live host:** absolute-academy.com is a Framer site (`server: Framer`, `framer-site-id` set). It belongs to the Framer project **"Absolute Academy"** (id `zrtVQjwe4zVXhqBAcRDr`, My Workspace). The apex resolves to `31.43.160.6` and `31.43.161.6`. `www` redirects to the apex.
- **Route:** `/calculator` and `/ti-nspire` return 404, so `/calculator` is free. `/atarcalculator` is an existing tool page on the same site and is the closest precedent.
- **Maths learning pages** (from the Framer sitemap): `/general`, `/methods`, `/specialist`, `/710maths`.
- **Core calculator in this repo:** the sibling "Framer calculator tab" build is unfinished and unpublished. It is served from the repo root and is not changed by this work.

## Live publication blockers (current)

The public route cannot go live in this turn. These blockers are listed in the order they must clear.

1. **Framer publish is blocked.** The "Absolute Academy" project's publish check fails because of an invalid form webhook and unrelated pending edits. Publishing would also ship those edits, so nothing was published or changed. The form webhook and the pending edits are left as they are. The `/calculator` page can be created in the editor, but it should be published only after the publish check passes.
2. **The updated core is not ready.** The calculator-core chat's changes are not final. The build in this repo is its unfinished build and must not be served publicly.
3. **The old public build is erroring.** I could not reach it from this sandbox (github.io is blocked by the proxy), so its URL is unconfirmed. The public route does not reference it. Its embed points only at `APP_URL` below.
4. **No verified app host yet.** Framer serves pages only, so the app (wrapper plus core) must be hosted elsewhere and embedded. Options: a dedicated subdomain (needs a DNS record, not verified here), or another static host with a verified URL. No existing path on absolute-academy.com can serve the app without a reverse proxy, and I could not verify that Framer provides one for this project.
5. **Engine not tested end to end.** `cdn.jsdelivr.net` is blocked in this sandbox, so the calculation engine has not been exercised in a browser here.
6. **Pricing wording unconfirmed.** Copy avoids "free" until pricing is confirmed.

### Single switch for the public route

The Framer embed points at one URL, `APP_URL`:

```
APP_URL = https://<APP_HOST>/calculator/
```

- `<APP_HOST>` is unset until an approved host is verified. The embed is not published with a placeholder.
- The wrapper loads the core from its host root (`../`). So when the calculator-core chat's changes are ready, redeploying that host's root updates the public route. No Framer change is needed.
- To roll back to nothing, remove the embed from the Framer page. Do not point `APP_URL` at any other build.

## Route architecture

| Piece | Where | Indexed? |
|---|---|---|
| Student entry page (copy, heading, embed, WebApplication data) | Framer page `/calculator` on absolute-academy.com | Yes. This is the indexable page. |
| Calculator app (help, tour, keypad toggle, clear session) | `calculator/` wrapper over the core, on a static host | No. `noindex`, canonical points to `/calculator`. |
| Calculator core | Static host root (unchanged) | Not part of this change |

The wrapper and core must be on the same origin, because Clear session and the keypad override work inside the core's same-origin document. Recommended static host: a dedicated subdomain such as `calculator.absolute-academy.com`, which is same-site with the apex.

## Gates before anything is published

1. **Sibling sign-off.** The core build in this repo is the sibling's unpublished work. Do not serve it publicly until that chat confirms it is final.
2. **Engine boot.** The core loads Pyodide from `cdn.jsdelivr.net`. That host is blocked by this sandbox's proxy (403), so the calculation engine has **not** been tested end to end here. Test on staging in a normal browser: solve, a fraction template, a saved document, Clear session.
3. **Pages source.** Enable GitHub Pages only from an approved folder or branch that contains the approved build. The feature branch must not be published. Check the repository's Pages settings first: if Pages already serves `main`, the current core may already be reachable at its github.io URL. This sandbox cannot reach github.io, so I could not confirm that.
4. **DNS (not applied).** Adding the subdomain needs DNS access. The record would be `calculator` **CNAME** `aafiles.github.io`. Confirm the exact target in the repo's Pages settings before adding it. Do not change the apex records (`31.43.160.6`, `31.43.161.6`), which point at Framer.
5. **Pricing wording.** "Free" is not used anywhere, because pricing is not confirmed in this work. Add an `offers` block to the JSON-LD only after pricing is confirmed.
6. **Tracking.** The Framer site has a `/google-ads-privacy` page, so site-level tags may load on `/calculator`. The wrapper itself has no analytics. Do not claim "no analytics" on the public page unless site-level tags are excluded.

## Framer change (exact, not applied)

Project: **Absolute Academy** (`zrtVQjwe4zVXhqBAcRDr`).

1. **Add page** with path `calculator` (URL `/calculator`). Do not add it to the main navigation.
2. **Page SEO:**
   - Title: `TI-Nspire Online Calculator: CAS, No Sign-In | Absolute CAS`
   - Description: `Online CAS calculator for VCE maths. Calculate in your browser with no sign-in, account or contact details. Independent, not affiliated with Texas Instruments.`
3. **Page copy:**

   > **H1:** Online CAS calculator for VCE maths
   >
   > Looking for a TI-Nspire online calculator? Absolute CAS is an independent online CAS calculator for VCE General, Methods and Specialist Mathematics. Start calculating straight away. There is no sign-in, no account and no contact details to give.
   >
   > Your calculations and notes stay in your browser. On a shared device, use Clear session when you finish.
   >
   > **H2:** How to use it
   > - Type on your keyboard and press Enter to calculate.
   > - Show the keypad when you need on-screen keys and the touchpad.
   > - Open "Using the calculator" in the tool for shortcuts, fraction templates and the quick tour.
   >
   > **H2:** About this tool
   > Absolute CAS is an independent educational tool made by Absolute Academy. It is not affiliated with, endorsed by or sponsored by Texas Instruments. TI-Nspire is a trademark of Texas Instruments.
   >
   > **H2:** Exams
   > Internet devices aren't allowed in VCAA exams. Use this calculator for study and practice, and check your exam rules.

4. **Embed** (Framer Embed component, HTML). Set `APP_URL` to the verified app host (see "Single switch" above). Do not publish while it is unset:

   ```html
   <iframe src="APP_URL" title="Absolute CAS calculator" style="width:100%;height:80vh;min-height:640px;border:0;border-radius:12px" allow="clipboard-read; clipboard-write"></iframe>
   ```

5. **Page head custom code** (this page only):

   ```html
   <script type="application/ld+json">
   {
     "@context": "https://schema.org",
     "@type": "WebApplication",
     "name": "Absolute CAS",
     "url": "https://absolute-academy.com/calculator",
     "description": "Online CAS calculator for VCE maths. Calculate in your browser with no sign-in, account or contact details.",
     "applicationCategory": "EducationalApplication",
     "operatingSystem": "Any modern web browser",
     "browserRequirements": "Requires JavaScript",
     "inLanguage": "en-AU",
     "audience": { "@type": "EducationalAudience", "educationalRole": "student" },
     "provider": { "@type": "Organization", "name": "Absolute Academy", "url": "https://absolute-academy.com/" }
   }
   </script>
   ```

6. **Internal links** (one text block on each page, placed in the existing resources or intro area; nothing else on these pages changes):
   - `/general`, `/methods`, `/specialist`, `/710maths`
   - Text: `Practise with the Absolute CAS online calculator. No sign-in needed.`
   - Link: `/calculator`

7. **Preview in Framer**, then publish only after every gate above passes.
8. **After publish, verify:**
   - `https://absolute-academy.com/calculator` returns 200 with the title and canonical above.
   - `https://absolute-academy.com/sitemap.xml` lists `/calculator`. Framer generates this sitemap; confirm it includes the new page.

## Rollback

Unpublish or delete the Framer `/calculator` page and remove the four link blocks. Remove the `calculator` DNS record if one was added. The `calculator/` folder can be deleted without touching the core.

## Files in this change

- `calculator/index.html`: student wrapper with SEO metadata, help dialog, quick tour, keypad toggle and clear-session confirmation.
- `calculator/calculator.css`: layout, focus styles and dialog styles. Dark palette matching the core.
- `calculator/calculator.js`: wrapper behaviour. Hides the keypad column in the core's document until a student asks for it, and truncates the status text. Clear session releases the core's IndexedDB connection, then deletes only `keyval-store`.
- `calculator/PUBLIC_ROUTE.md`: this note.

The core files (`index.html`, `next/`, `py/`, `mathlive/`, `cas.worker.js`, `manifest.webmanifest`) are not modified.

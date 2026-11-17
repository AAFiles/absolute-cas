# Public route: calculator.absolute-academy.com

Status: **not live.** Nothing is deployed. No Pages setting or DNS record has been changed.

## Route

| Route | Role |
|---|---|
| `https://calculator.absolute-academy.com/calculator/` | First public entry. The student page, indexable. |
| `https://calculator.absolute-academy.com/` | The calculator core, served at the subdomain root. The wrapper frames it via `../`, so it stays same-origin. |
| `https://absolute-academy.com/calculator` | Later, optional Framer cross-link. |

## Branches

- **`claude/beautiful-cori-0dnbs3`** is the reviewable wrapper output. `calculator/` is developed here first.
- **`deploy/calculator`** is the deployment branch. It is based on `main` (`de45f21`). It contains `calculator/` synced from the feature branch, plus a root `robots.txt`. Until the core handoff is integrated, its core files are the unfinished build inherited from `main`. Pages must not be pointed at this branch until P1 below is complete.

## Prerequisites

Both must be complete before any Pages or DNS change.

**P1. Core handoff integrated.** The calculator-core chat's approved commits are merged or cherry-picked into `deploy/calculator`. Then:
- Confirm the core files (`index.html`, `next/`, `py/`, `mathlive/`, `cas.worker.js`, `manifest.webmanifest`) match the approved commit.
- Confirm `calculator/` and `robots.txt` are present at the expected paths.
- Run the browser checks against the root and `/calculator/` on the branch.

**P2. Hosting settings verified.** Record the current GitHub Pages configuration before changing it: source branch and folder, custom domain, and HTTPS. Check whether Pages already serves an older build at the github.io URL. That build is erroring and must not be linked.

## Deployment order (after P1 and P2)

1. Set Pages to source `deploy/calculator`, folder root. Set the custom domain to `calculator.absolute-academy.com`. This is the first step that exposes anything, which is why it comes after P1.
2. Add the DNS record last: `calculator` CNAME to the Pages target confirmed in step 1. Do not change the apex records (`31.43.160.6`, `31.43.161.6`, Framer).
3. Wait for DNS and the certificate, then enforce HTTPS.
4. Verify the live host:
   - `https://calculator.absolute-academy.com/calculator/` returns 200, with the title, canonical, `robots: index, follow` and the JSON-LD.
   - `https://calculator.absolute-academy.com/` loads the core.
   - `https://calculator.absolute-academy.com/robots.txt` returns the rules below.
   - `https://calculator.absolute-academy.com/calculator/sitemap.xml` returns 200.
5. In a normal browser on the live host, run a calculation, a fraction template, a saved document and Clear session.
6. Add the subdomain as a Search Console property and submit `calculator/sitemap.xml`.

## robots.txt (on `deploy/calculator`, root)

```
User-agent: *
Allow: /calculator/
Allow: /icons/
Disallow: /

Sitemap: https://calculator.absolute-academy.com/calculator/sitemap.xml
```

The core's root page has no noindex and still carries the old title, so it must not be crawled as a second page. This file keeps crawlers on `/calculator/`. `Disallow` stops crawling, not indexing, so the root should not be linked from anywhere.

## Copy and tracking

- The copy makes no pricing claims. If pricing is set later, add an `offers` block to the JSON-LD.
- The subdomain has no analytics. If any is added, update the disclosure first.

## Later: Framer cross-links

- **Maths pages:** add a text link on `/general`, `/methods`, `/specialist` and `/710maths` pointing directly at `https://calculator.absolute-academy.com/calculator/`. No Framer page is needed.
- **Optional `/calculator` page on absolute-academy.com:** a short link-out page, with its canonical set to the subdomain URL.
- The Framer project's publish check is blocked by an invalid form webhook and unrelated pending edits. Those items are not touched. These cross-links wait until Framer publishing works.

## Rollback

- Set Pages to disable, or change its source back.
- Remove the `calculator` CNAME record.
- Revert `deploy/calculator`.
- The feature branch is not affected.

## Files

- `calculator/index.html`: the indexable entry page. Metadata, visible copy, WebApplication JSON-LD, help dialog, quick tour, keypad toggle and Clear session.
- `calculator/calculator.css`: layout, focus styles and dialogs.
- `calculator/calculator.js`: frame overrides (keypad hidden until requested, status truncation) and Clear session. It deletes only the core's `keyval-store` IndexedDB database.
- `calculator/sitemap.xml`: sitemap for the entry page. It lives under `/calculator/`, so it can only list URLs under that path.
- `calculator/PUBLIC_ROUTE.md`: this note.

The core files are not modified on this branch.

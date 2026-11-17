# Public route: calculator.absolute-academy.com

Status checked 2026-11-17. **Not live.** Nothing has been published. No CNAME record, DNS record, GitHub Pages setting or Framer page has been changed.

## Route

| Route | Role | Status |
|---|---|---|
| `https://calculator.absolute-academy.com/calculator/` | **First public entry.** The student page, indexable. | Ready in this branch, not deployed |
| `https://calculator.absolute-academy.com/` | The calculator core, served at the subdomain root. The wrapper frames it via `../`, so it stays same-origin. | Core still being finished on another branch |
| `https://absolute-academy.com/calculator` | Optional Framer cross-link, **later**. | Blocked (see below) |

The wrapper is the page students and search engines land on. Its canonical is `https://calculator.absolute-academy.com/calculator/` and robots allows indexing. The iframe, the keypad toggle, the help guide and Clear session all work against the core on the same host.

## Blockers to going live

1. **Unfinished core.** The calculator-core chat's changes are not final, and this branch's core is its unfinished build. It must not be served publicly.
2. **Core changes are on another branch.** They must be integrated into the deploy branch before the host is considered ready. Name of that branch: `<core-branch>` (to be provided). See gate G1.
3. **Pages configuration unverified.** Pages must be checked before anything changes. If Pages already serves a branch, the current core may be reachable at its github.io URL. This sandbox cannot reach github.io, so I could not check. The old public build is erroring and must not be linked to.
4. **DNS record not added.** The record is `calculator` CNAME → the Pages host. Confirm the exact target in the repository's Pages settings before adding it. The apex records (`31.43.160.6`, `31.43.161.6`, Framer) must not change.
5. **Engine not tested end to end.** `cdn.jsdelivr.net` is blocked in this sandbox, so calculations have not been run in a browser here.
6. **Framer is blocked.** The "Absolute Academy" project's publish check fails because of an invalid form webhook and unrelated pending edits. Those are not touched. The Framer work is optional and comes last.

## Gates: the host is ready only when all of these pass

**G1. Core integrated into the deploy branch.**
- The sibling's approved core commit(s) from `<core-branch>` are merged or cherry-picked onto the deploy branch. The deploy branch must not be this feature branch as it stands, because it contains the unfinished core.
- Verify that the deployed `index.html`, `next/`, `py/`, `mathlive/`, `cas.worker.js` and `manifest.webmanifest` match the approved commit, and that `calculator/` is present.

**G2. Deploy branch chosen (decision needed).** Recommendation: a dedicated branch such as `deploy/calculator` containing only the approved core and `calculator/`. Pages then serves that branch, root folder. Do not publish the feature branch.

**G3. Pages configuration verified.** Before any change, record the current Pages source, custom domain and HTTPS setting, and what it serves. Repository admin access is needed for this.

**G4. DNS verified and added last.** Add `calculator` CNAME → the verified Pages target. Wait for the certificate, then enforce HTTPS.

**G5. Engine works on the deployed host.** In a normal browser, run a calculation, a fraction template, a saved document and Clear session.

**G6. Pricing wording confirmed.** Copy avoids "free" until pricing is confirmed. Add an `offers` block to the JSON-LD only after that.

**G7. Tracking.** The wrapper and the subdomain have no analytics. If any is added, update the disclosure before publishing.

## Activation steps (only after G1–G7)

1. Create the deploy branch with the approved core and `calculator/` (G1, G2).
2. Set Pages to the deploy branch, root folder, custom domain `calculator.absolute-academy.com` (G3).
3. Add the DNS CNAME (G4). Wait for DNS and certificate.
4. **Required deploy-time `robots.txt` at the subdomain root** (added on the deploy branch, not under `calculator/`, because robots files only apply at the root):

   ```
   User-agent: *
   Allow: /calculator/
   Disallow: /

   Sitemap: https://calculator.absolute-academy.com/calculator/sitemap.xml
   ```

   Why: the core's root page has no noindex and still carries the old title "Absolute CAS — VCE CAS & Graphing Companion". Served at the subdomain root, it could be crawled as a second, duplicate page. This file keeps crawlers on `/calculator/`. The core can't be changed on this branch, so this is the control that applies. Note that `Disallow` stops crawling, not indexing, so if the root URL is ever linked from elsewhere it could still appear as a bare URL. Don't link to it.

5. Verify:
   - `https://calculator.absolute-academy.com/calculator/` returns 200, with the title, canonical, `robots: index, follow`, and the JSON-LD.
   - `https://calculator.absolute-academy.com/` loads the core, with Pages serving the deploy branch.
   - `https://calculator.absolute-academy.com/calculator/sitemap.xml` returns 200 and lists the entry page.
6. Add the subdomain as a Search Console property, then submit `calculator/sitemap.xml`.
7. Run G5 on the live host.

## Later, optional: Framer cross-links (after Framer publishing is unblocked)

- **Maths pages:** add a text link on `/general`, `/methods`, `/specialist` and `/710maths` pointing directly at `https://calculator.absolute-academy.com/calculator/`. No Framer calculator page is needed for this.
- **Optional `/calculator` page on absolute-academy.com:** if created, make it a short link-out page, not a copy of the tool. Its canonical should point to the subdomain URL, so the two pages don't compete in search.
- Keep the Framer form webhook and unrelated pending edits as they are. Do not publish the Framer project until its publish check passes.

## Rollback

- Remove the `calculator` CNAME, or disable Pages.
- Revert or delete the deploy branch.
- The feature branch is unaffected by either step.

## Files in this change

- `calculator/index.html`: indexable student entry page. Metadata, visible copy, WebApplication JSON-LD, help dialog, quick tour, keypad toggle and Clear session.
- `calculator/calculator.css`: layout, focus styles, dialogs.
- `calculator/calculator.js`: frame overrides (keypad hidden until requested, status truncation) and Clear session. It deletes only the core's `keyval-store` IndexedDB database.
- `calculator/sitemap.xml`: sitemap for the entry page. Lives under `/calculator/`, so it can list only URLs under that path.
- `calculator/PUBLIC_ROUTE.md`: this note.

The core files (`index.html`, `next/`, `py/`, `mathlive/`, `cas.worker.js`, `manifest.webmanifest`) are not modified.

# Public route: calculator.absolute-academy.com

Status: **not live.** Nothing is deployed. No Pages setting or DNS record has been changed.

## Route

| Route | Role |
|---|---|
| `https://calculator.absolute-academy.com/calculator/` | First public entry. The student page, indexable. |
| `https://calculator.absolute-academy.com/` | The calculator core, served at the subdomain root. The wrapper frames it via `../`, so it stays same-origin. |
| `https://absolute-academy.com/calculator` | Later, optional Framer cross-link. |

## Branches and commits

| Branch | Commit | Contents | Status |
|---|---|---|---|
| `claude/beautiful-cori-0dnbs3` | see `git log` | `calculator/` (wrapper, sitemap, this spec). Reviewable wrapper output. No core changes. No test files. | Source of truth for `calculator/`. |
| `deploy/calculator` | see `git log` | Based on `main` (`de45f21`). `calculator/` synced from the feature branch, plus a root `robots.txt`. Its core files are the build inherited from `main`. | Deployment prep. Not deployed. Pages not pointed at it. |
| `parity-section-7-ledger` (core chat) | `125bd0a4` | 37 files changed against `main` (+246 / −8). Active debugging by the core chat. | **Not final. Not merged. Not in `deploy/calculator`.** |

## Current blockers

Each blocker must be cleared before the host can be treated as ready.

**B1. Core not final.** `parity-section-7-ledger` at `125bd0a4` is still being debugged by the core chat. Nothing from it is integrated. Integration starts only once the core chat marks the branch final.

**B2. Math result wrong.** The core chat's latest end-to-end check reports `1/3 + 1/6` returning `196` instead of `1/2`. The final core must return `1/2`.

**B3. Keypad DOM changed.** The core chat reports that the current keypad DOM no longer matches the wrapper's hook. Until `calculator.js` and `calculator.css` are updated to the final DOM, the keypad toggle and the hidden-keypad layout can't be trusted. The hooks are listed in the contract below.

**B4. Clear session leaves a recent-documents entry.** The wrapper's Clear session deletes only the IndexedDB database `keyval-store`. The recent-documents entry therefore lives somewhere else in the core. The storage location is not yet identified. It must be found on the final core, and Clear session must remove it.

**B5. Earlier checks used stale core.** Every wrapper check run so far ran against the stale core on `origin/main` (`de45f21`), not against `parity-section-7-ledger`. That covers the 39 checks from the earlier turn and the 41-check run on the wrapper, metadata and layout. They are not evidence that the wrapper is compatible with the core chat's current working tree. In particular, the engine-dependent checks (the `1/3 + 1/6` result and the storage round trip) could not run here, because `cdn.jsdelivr.net` is blocked by the sandbox proxy. The axe-core scan covered the wrapper's own DOM only, not the core iframe.

**B6. Hosting not verified.** The GitHub Pages source, custom domain and HTTPS settings have not been checked, and no DNS record exists. Pages must not point at `deploy/calculator` until B1–B5 are cleared and the Pages settings are verified.

**B7. Framer publishing blocked (optional path only).** The Framer project's publish check fails because of an invalid form webhook and unrelated pending edits. Those items are not touched. The Framer cross-links wait until publishing works.

## Contract: what the wrapper depends on in the core

The wrapper reads these hooks and keys. The final comparison checks each one against the approved core.

**DOM hooks** (inside the core document, read by `calculator.js` and `calculator.css`):

- `.shell`: the two-column (desktop) or two-row (phone) shell. The keypad column is its second child.
- `.shell > :has(> [data-testid="keypad"])`: the keypad column, hidden by the `html.abs-keypad-off` override.
- `[data-testid="keypad"]`: the keypad grid.
- `[data-testid="cas-status"]`: the engine status text, truncated by the override.
- `[data-testid="calculator"]`: the screen and result area.
- `math-field`, `[contenteditable="true"]` or `textarea`: the input that receives focus when the wrapper focuses the calculator.

**Storage keys** (what Clear session has to remove):

- IndexedDB `keyval-store`, store `keyval`. This is the only storage the stale core uses, and Clear session deletes it.
- Any other IndexedDB database, localStorage or sessionStorage key, or Cache Storage entry used by the final core, including the recent-documents entry (B4). These are not known yet.

## Final compatibility check (when the core chat marks its branch final)

The user will coordinate the integration. The steps are:

1. Record the approved core commit SHA. Integrate only that commit (merge or cherry-pick) into `deploy/calculator`.
2. Compare the final core's DOM hooks against the contract above, and list its storage locations, including IndexedDB databases and stores, localStorage, sessionStorage and Cache Storage. Find the recent-documents storage (B4).
3. Update `calculator.js` and `calculator.css` on the feature branch to match. Do not change the core.
4. Verify each blocker against that exact commit: `1/3 + 1/6` shows `1/2` (B2); the keypad shows and hides with the core's current DOM (B3); Clear session leaves no calculator data (B4).
5. Rerun the wrapper checks on that same commit. Record the commit SHA and the results in the review notes. The check suite is not part of the repository.
6. Sync `calculator/` to `deploy/calculator`. Leave it undeployed until B6 is cleared.

## Deployment order (after B1–B6 are cleared)

1. Set Pages to source `deploy/calculator`, folder root, custom domain `calculator.absolute-academy.com`. Only do this after the integrated core has passed the final check.
2. Add the DNS record last: `calculator` CNAME to the Pages target shown in step 1. Do not change the apex records (`31.43.160.6`, `31.43.161.6`, Framer).
3. Wait for DNS and the certificate, then enforce HTTPS.
4. Verify the live host:
   - `https://calculator.absolute-academy.com/calculator/` returns 200, with the title, canonical, `robots: index, follow` and the JSON-LD.
   - `https://calculator.absolute-academy.com/` loads the core.
   - `https://calculator.absolute-academy.com/robots.txt` returns the rules below.
   - `https://calculator.absolute-academy.com/calculator/sitemap.xml` returns 200.
5. On the live host, in a normal browser, repeat the B2, B3 and B4 checks.
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

## Rollback

- Set Pages to disable, or change its source back.
- Remove the `calculator` CNAME record.
- Revert `deploy/calculator`.
- The feature branch is not affected.

## Files

- `calculator/index.html`: the indexable entry page. Metadata, visible copy, WebApplication JSON-LD, help dialog, quick tour, keypad toggle and Clear session.
- `calculator/calculator.css`: layout, focus styles and dialogs.
- `calculator/calculator.js`: frame overrides (keypad hidden until requested, status truncation) and Clear session. It currently deletes only the core's `keyval-store` IndexedDB database. See B4.
- `calculator/sitemap.xml`: sitemap for the entry page. It lives under `/calculator/`, so it can only list URLs under that path.
- `calculator/PUBLIC_ROUTE.md`: this note.

The core files are not modified on this branch.

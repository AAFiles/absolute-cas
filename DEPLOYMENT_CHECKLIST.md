# Deployment checklist — Absolute CAS

Status: **NOT READY.** Do not publish or add the Framer tab yet. Parity gaps remain (see PARITY_LEDGER.md, section 7).

## Gates (all must pass)

- [ ] PARITY_LEDGER.md section 7 has no open items, or each remaining item is accepted in writing by the owner.
- [ ] Notes math box evaluates on Enter in the browser (`tests/e2e/behavior.mjs`, currently FAIL).
- [ ] Browser checks added for Geometry tools, the Graphs conic menu, residual plot and window settings.
- [ ] `python3 tests/engine_test.py` 128/128; `python3 tests/graph_test.py`; `tests/geo/geo_test.js` 44; `tests/stat/statplot_test.js` 19.
- [ ] `npx tsc --noEmit -p .` clean.
- [ ] `python3 tests/parity/static_check.py` exits 0.
- [ ] `node tests/e2e/apps.mjs` mounts all five apps with no page errors.
- [ ] Production build (no test-only environment variables) served and smoke-tested.

## Hosting and Framer

- [ ] Hosting route confirmed. The push path from this session is blocked (HTTP 415 from the GitHub proxy). Use only the sanctioned repository-access route (add_repo with push access). Do not use other credentials to get around the block.
- [ ] Deployment target: the Pages build of the deployable clone (`absolute-cas`, main). Confirm the live URL before linking.
- [ ] Framer calculator page and the "CAS Calculator" nav tab are on branch `pastel-river`, not merged. Merge or delete only on explicit user instruction.
- [ ] Parent origin for embedding is `https://absolute-academy.com` (listed in .env.example, not yet confirmed against the live site).

## Known hardware-only behaviour (stated, not implemented in a browser)

- Physical keys, LCD, bezel, battery indicator, physical touchpad click.
- Press-to-Test self-test, power on/off, USB and Navigator connectivity.

# Absolute CAS — TI-Nspire CX II CAS parity ledger

Status: **NOT one-to-one.** Gaps remain (section 7). This ledger is the audit the brief asks for; it is not a completion claim.

Target: TI-Nspire CX II CAS handheld (brief from the user's uploaded attachment). Guide sections consulted: Lists & Spreadsheet (`m_listssheet`), Data & Statistics (`m_datastats`), Student Software index (`splash_studentsw`).

Status keys
- **V-browser**: exercised in the built app in headless Chrome during this audit.
- **V-code**: covered by an automated code-level check (engine, geometry, statistics helpers, typecheck). Not clicked in a browser.
- **I-unverified**: implemented in code, no check or a failing check.
- **Partial**: some of the TI behavior exists.
- **Missing**: TI feature has no implementation (menu entry notifies "Not in this build yet", or no code).
- **Hardware-only**: cannot exist in a browser; stated explicitly.
- **Not audited**: not re-checked in this audit; status carried from earlier batches, unverified.

## 1. Shell and input

| Item | Status | Evidence / note |
|---|---|---|
| Home, Esc, Enter, arrows, Del, Tab, numbers, operators, templates | V-browser (earlier smoke) | CAS boots, keypad entry, fractions, sqrt (`tests/e2e/smoke.mjs`) |
| Menu → Algebra → Solve | V-browser (earlier smoke) | same |
| Physical keyboard forwarding | I-unverified | `handlePhysicalKey` forwards only when a modal target exists; Notes case fails (below) |
| Ctrl+Esc / z undo, math-field entry undo | Partial | MathLive `undo` command works on the entry; undo of a calculator history evaluation is not implemented |
| Shift/Var/Ctrl/second-function shortcuts (full set) | Not audited | |
| Status line (angle mode, battery) | Not audited | battery is hardware-only |
| Touchpad directions / key repeat | Partial | on-screen arrows work; physical touchpad is hardware-only |

## 2. Home, Scratchpad, documents

| Item | Status | Evidence / note |
|---|---|---|
| Home overlay / app launcher | V-browser (earlier smoke) | |
| Add to Document → Graphs | V-browser | `behavior.mjs` |
| Insert Math Box in Notes | V-browser (insert only) | |
| Document/problem/page tree, split screen | Not audited | |
| Recent files / library | Missing | no code for recent or library |
| Save / rename / close document | Not audited | My Documents overlay exists in `DocOverlays.tsx` |
| Variables and locking, library access | Not audited | |

## 3. Calculator / CAS

| Item | Status | Evidence / note |
|---|---|---|
| Finance solver, PMT (60, 5%, PV 10000) | V-browser | result 188.712, matches reference 188.71 |
| Statistics z-interval (n=30, σ=1) | V-browser | ME 0.357839, matches 1.959964/√30 |
| Engine, 128 math cases | V-code | `tests/engine_test.py` 128/128 |
| Exact/approx/auto, settings, angle, digits | Not audited | |
| Units, constants, complex/polar modes | Not audited | |
| Function tables (generate table of values) | Missing | TI Lists guide lists this topic; not implemented |
| Calculator history undo | Missing | see section 1 |

## 4. Graphs and Geometry

| Item | Status | Evidence / note |
|---|---|---|
| Function plotting (`x^2`) | V-browser | relation `y=x^2` |
| Implicit conics: circle, ellipse, hyperbola, parabola (axis-aligned) | V-code (engine) / I-unverified (UI) | `graph checks passed` covers all four types with hand-computed values; UI menu `c:conic:*` wired to `runConic`, not clicked |
| Conics with xy term (rotated) | Missing | engine rejects with a clear message |
| Residual plot, window settings, normal curve on histogram | V-code / mount-only | typecheck; `statplot_test.js` 19 checks; DataStats mounts |
| Table settings, trace step (Graphs) | Missing | notify "Not in this build yet" |
| Geometry tools: point on, tangent, vector, text, polygon, regular polygon, angle bisector, reflect, rotate, dilate, translate, symmetry | V-code | `geo_test.js` 44 checks (transforms, cascade delete, one-pass intersections). Not clicked in a browser |
| Geometry undo, delete cascade | V-code | |
| 3D graphing, rotation, trace | Not audited | |

## 5. Lists & Spreadsheet, Data & Statistics

| Item | Status | Evidence / note |
|---|---|---|
| Lists app mounts | V-browser | `apps.mjs` |
| Data & Statistics app mounts | V-browser | `apps.mjs` |
| Stat calculations, confidence intervals, distributions | V-browser (z-interval) | others not audited |
| Stat tests (2-sample) | Partial | list-only |
| Lists "Table" menu | Removed | the guide has no Lists Table menu or "Switch to Function Table" command; the dead entry was removed |
| Animate, Lock Intercept, Movable Line on/off, Plot Function, Plot Value, Residual Squares | Missing | menu entries notify "Not in this build yet"; the Data & Statistics guide page did not describe these commands, so their semantics are unconfirmed |

## 6. Notes, programs, other apps

| Item | Status | Evidence / note |
|---|---|---|
| Notes app mounts | V-browser | `apps.mjs` |
| Math box evaluates `2+3` to 5 on Enter | I-unverified (failing) | `behavior.mjs` FAIL. Enter does not evaluate in the math box; the on-screen Enter path and physical Enter were not compared. Stopped here per the instruction not to loop |
| Chemical equations, comments, images, shapes in Notes | Missing / not audited | |
| TI-Basic program / function editor | Not audited | `ProgramEditor.tsx` exists |
| Python editor / shell | Not audited | no check in this audit |
| DataQuest, other installed apps | Missing / not audited | |
| Press-to-Test | Hardware-only (classification) | a handheld self-test. Not verified against the guide in this audit |
| Exam Test Mode (app locking) | Missing | not implemented |

## 7. Open gaps (must close before "one-to-one")

Closed and browser-verified this pass:
- Notes math box: physical Enter evaluates (tests/e2e/behavior.mjs, 4/4).
- Data & Statistics: Animate Points (Pause/Reset), Lock Intercept at Zero, Add/Remove Movable Line, Plot Function, Plot Value and Remove Value, Show Residual Squares, Residual Plot with model choice and Hide, Graph Trace with arrows and Esc (tests/e2e/datastats.mjs, 7/7; SSE 39.708 and 220.91 match hand calculation).
- Graphs: Edit Table Settings (Table Start, Table Step, Auto or Ask), one table column per visible function, Ask mode fills only picked rows, Trace Step (Automatic or a number), trace arrows, Enter sets x, Esc stops (tests/e2e/graphs.mjs, 3/3).
- Rotated conics (xy term) in engine: ellipse and rectangular hyperbola checked by hand values (graph_test.py). Not yet exercised through the Graphs conic menu in a browser.
- Static parity: 170 menu actions, 0 unhandled (tests/parity/static_check.py).

Still open (not finished, not claimable as done):
- Graphs has no Residual Squares menu entry (it is a Data & Statistics item, closed above). The unreachable Graphs notice was removed.
- Geometry: one fallback still shows "Not in this build yet" for an unmapped transform id. No menu entry produces that id (all five transforms are mapped), so it is a guard, not a user-visible gap. Geometry browser checks are still missing.
- Lists function table: Ctrl+T view, Table Settings, Ask mode, Choose, Delete Column, Edit Expression (ls_working_with_function_tables). Not built. The Lists "Switch to Function Table" entry was removed because it had no handler.
- Calculator history undo, recent documents, libraries (m_libraries.HTML not fetched yet). Not built.
- Audits not done: Python editor and programs, DataQuest (guide location unknown), settings (angle, format, digits, CAS mode), units (Appendix A conversion categories), 3D graphs (m_graphs3d.HTML), full key set (splash_handhelds.HTML), Test Mode (m_testmode.HTML).
- Browser checks not yet run: Geometry tools, Graphs conic menu, Graphs window settings.
- Deployment: blocked. No hosting credentials are available here, and the push route returned HTTP 415 earlier. The Framer Calculator tab cannot be added until a static host exists.

Interpretations to verify against a handheld (not confirmed from the guide):
- Movable line starts at slope 0 through mean(y).
- Rotation pivot is the window midpoint.
- Residual square geometry: side |r| px, drawn to the right of the point.
- Animate speed is x-units per second. Unidirectional mode wraps; alternate mode bounces.
- Animated points are attached to the model automatically; the Graphs guide requires selecting a point.
- Trace Step "Automatic" is not described in the guide; the implementation uses (xmax - xmin) / 100.

## 8. Hardware-only (cannot exist in a browser)

- Physical key feel, the LCD, the bezel, the battery indicator.
- The physical touchpad and its click.
- Press-to-Test self-test (classified above).
- Power on/off, sleep, and USB or Navigator connectivity.

## 9. Reproduce the checks

```
npm run build                      # with NEXT_PUBLIC_CAS_THREAD=main NEXT_PUBLIC_BASE_PATH=. for the bundled test variant
python3 tests/engine_test.py       # 128/128
python3 tests/graph_test.py        # graph checks passed (includes conic)
sh tests/geo/build.sh && node tests/geo/geo_test.js          # geometry checks passed: 44
sh tests/stat/build.sh && node tests/stat/statplot_test.js   # statistics plot checks passed: 19
npx tsc --noEmit -p .              # clean
python3 tests/parity/static_check.py   # app menu actions: 166, unhandled: 9 (7 DataStats, 2 Graphs)
node tests/e2e/apps.mjs            # all five apps mount, no page errors
node tests/e2e/behavior.mjs        # 3 pass, 1 FAIL (Notes math box)
```
